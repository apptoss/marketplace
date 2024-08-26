module apptoss::limbo {
    use apptoss::friend_pool;

    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::randomness;
    use aptos_framework::signer;
    
    const FEE_BPS: u64 = 100;
    const E: u64 = 16_777_216;
    const MAX_MULTIPLIER_PCT: u64 = 1_000_000 * 100;

    #[event]
    struct Limbo has drop, store {
        pool: address,
        player: address,
        collateral: u64,
        expect_multiplier_pct: u64,
        actual_multiplier_pct: u64,
        pay_ratio_bps: u64,
    }

    #[randomness]
    entry fun place_coin<CoinType>(player: &signer, origin: address, expect_multiplier_pct: u64, collateral: u64) {
        let seed = randomness::u32_integer();
        let crash_point = generate_multiplier_pct(seed);

        let pay_ratio_bps = if (crash_point >= expect_multiplier_pct) { expect_multiplier_pct * 100 } else { 0 };

        let coin = coin::withdraw<CoinType>(player, collateral);
        let fa = coin::coin_to_fungible_asset(coin);
        let metadata = fungible_asset::asset_metadata(&fa);
        friend_pool::hold(origin, fa);

        let player_address = signer::address_of(player);

        if (pay_ratio_bps > 0) {
            let payout = collateral * pay_ratio_bps / 10_000;
            friend_pool::credit(origin, metadata, payout, player_address);
        };

        let pool = friend_pool::get_pool_address(origin, metadata);

        event::emit(Limbo{
            pool,
            player: player_address,
            collateral,
            expect_multiplier_pct,
            actual_multiplier_pct: crash_point,
            pay_ratio_bps,
        });
    }
    
    inline fun generate_multiplier_pct(seed: u32): u64 {
        let number = (seed as u64) * E / (1 << 32); // range [0, 16777215]
        let multiplier_pct = E * (10_000 - FEE_BPS) / (number + 1) / 100; // two decimal places
        if (multiplier_pct > MAX_MULTIPLIER_PCT) {
            MAX_MULTIPLIER_PCT
        } else {
            multiplier_pct
        }
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
    use std::debug;

    #[test_only]
    use std::option;

    #[test]
    fun test_derive_rng() {
        let seed = 1828728675;
        debug::print(&seed);
        let number = (seed as u64) * E / (1 << 32); // range [0, 16777215]
        debug::print(&number);
        let multiplier_pct = E * (10_000 - FEE_BPS) / (number + 1);
        debug::print(&multiplier_pct);
        debug::print(&generate_multiplier_pct(seed));
    }
    
    #[test(
        fx = @aptos_framework,
        player = @0xc4fe,
        bettor = @0xc0ffee,
        origin = @0xd2,
    )]
    fun test(fx: &signer, player: &signer, bettor: &signer, origin: &signer) {
        randomness::initialize_for_testing(fx);
        
        // init_module equivalent
        package_manager::initialize_for_test(&account::create_signer_for_test(@apptoss));
        
        // Mint APT
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(fx);
        let coin = coin::mint<AptosCoin>(1000000, &mint_cap);
        let coin2 = coin::mint<AptosCoin>(1000000, &mint_cap);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        // Setup a friend pool before play
        friend_pool::create_pool_coin<AptosCoin>(origin);

        let metadata = option::extract(&mut coin::paired_metadata<AptosCoin>());

        {
            // Deposit APT to the player
            let player_address = signer::address_of(player);
            aptos_account::deposit_coins(player_address, coin);
            let balance = coin::balance<AptosCoin>(player_address);
            assert!(balance == 1000000, 0);

            // Coin as collateral
            let origin_address = signer::address_of(origin);
            place_coin<AptosCoin>(player, origin_address, 102, 100);

            let credit = friend_pool::get_credit(origin_address, metadata, player_address);
            debug::print(&credit);
        };

        {
            // Deposit APT to the bettor
            let bettor_address = signer::address_of(bettor);
            aptos_account::deposit_coins(bettor_address, coin2);
            let balance = coin::balance<AptosCoin>(bettor_address);
            assert!(balance == 1000000, 0);

            // Coin as collateral
            let origin_address = signer::address_of(origin);
            place_coin<AptosCoin>(bettor, origin_address, 198, 100);

            let credit = friend_pool::get_credit(origin_address, metadata, bettor_address);
            debug::print(&credit);
        };
    }
}
