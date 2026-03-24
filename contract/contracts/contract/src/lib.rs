#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Env, Address, Symbol
};

#[contract]
pub struct StakingContract;

#[derive(Clone)]
#[contracttype]
pub struct StakeInfo {
    pub amount: i128,
    pub timestamp: u64,
}

fn get_key(user: &Address) -> (Symbol, Address) {
    (Symbol::short("stake"), user.clone())
}

#[contractimpl]
impl StakingContract {

    // Stake tokens
    pub fn stake(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let key = get_key(&user);

        let current_time = env.ledger().timestamp();

        let stake_info = StakeInfo {
            amount,
            timestamp: current_time,
        };

        env.storage().instance().set(&key, &stake_info);
    }

    // Withdraw stake
    pub fn withdraw(env: Env, user: Address) -> i128 {
        user.require_auth();

        let key = get_key(&user);

        let stake_info: StakeInfo = env
            .storage()
            .instance()
            .get(&key)
            .expect("No stake found");

        env.storage().instance().remove(&key);

        stake_info.amount
    }

    // View stake
    pub fn get_stake(env: Env, user: Address) -> Option<StakeInfo> {
        let key = get_key(&user);
        env.storage().instance().get(&key)
    }
}