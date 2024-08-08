module apptoss::coinflip {
    use apptoss::friend_pool;
    
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::randomness;
    use aptos_framework::signer;
    
    use std::fixed_point32::{Self, multiply_u64};

    const FLIP_MULTIPLIER: u64 = 2;
    const FLIP_FEE_BPS: u64 = 100;

    #[event]
    struct FlipEvent has drop, store {
        flip_result: u64,
        is_win: bool,
    }

    #[randomness]
    entry fun place_coin<CoinType>(player: &signer, origin: address, outcome: bool, aptCollateral: u64) {
        let flip_result = randomness::u64_range(0, 2);
        let is_win = (flip_result == 1 && outcome) || (flip_result == 0 && !outcome);

        let fee_multiplier = fixed_point32::create_from_rational(10000 + FLIP_FEE_BPS, 10000);
        let amount_with_fees = multiply_u64(aptCollateral, fee_multiplier);
        let coin = coin::withdraw<CoinType>(player, amount_with_fees);
        let fa = coin::coin_to_fungible_asset(coin);
        let metadata = fungible_asset::asset_metadata(&fa);

        // transfer bet amount + fees to the vault
        friend_pool::hold(origin, fa);
        
        let pay_ratio = if (is_win) { FLIP_MULTIPLIER } else { 0 };
        if (pay_ratio > 0) {
            // double bet amount
            let payout = aptCollateral * pay_ratio;
            // rewards player
            friend_pool::credit(origin, metadata, payout, signer::address_of(player));
        };

        event::emit(FlipEvent{
            flip_result,
            is_win,
        });
    }

    #[test_only]
    use apptoss::package_manager;

    #[test_only]
    use aptos_framework::account;

    #[test_only]
    use aptos_framework::aptos_account;

    #[test_only]
    use aptos_framework::aptos_coin::{Self, AptosCoin};

    #[test_only]
    use std::option;

    #[test(
        fx = @aptos_framework, 
        player = @0xc4fe,
        origin = @0xd2,
    )]
    fun test(fx: &signer, player: &signer, origin: &signer) {
        // init_module equivalent
        package_manager::initialize_for_test(&account::create_signer_for_test(@apptoss));
        
        // Mint APT
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(fx);
        let coin = coin::mint<AptosCoin>(1000000, &mint_cap);
        let metadata = option::extract(&mut coin::paired_metadata<AptosCoin>());

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        // Setup a friend pool before play
        friend_pool::create(origin, metadata);
        
        // Deposit APT to the player
        let player_address = signer::address_of(player);
        aptos_account::deposit_coins(player_address, coin);
        let balance = coin::balance<AptosCoin>(player_address);
        assert!(balance == 1000000, 0);

        // Coin as collateral
        randomness::initialize_for_testing(fx);
        let origin_address = signer::address_of(origin);
        place_coin<AptosCoin>(player, origin_address, true, 1337);
    }
}
