module apptoss::dice {
    use apptoss::friend_pool;

    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::randomness;
    use aptos_framework::signer;

    use std::option;

    const FEE_BPS: u32 = 100;

    #[event]
    struct Dice has drop, store {
        pool: address,
        player: address,
        collateral: u64,
        is_roll_over: bool,
        expect_hundredths: u16,
        actual_hundredths: u16,
        pay_ratio_bps: u64,
    }

    #[randomness]
    entry fun place_coin<CoinType>(
        player: &signer, 
        origin: address, 
        is_roll_over: bool,
        expect_hundredths: u16, 
        collateral: u64
    ) {
        let actual_hundredths = randomness::u16_range(0, 10001); // range [0, 10000]
        let win = if (is_roll_over) { actual_hundredths > expect_hundredths } else { actual_hundredths < expect_hundredths };
        let pay_ratio_bps = if (win) { get_pay_ratio_bps(is_roll_over, expect_hundredths) } else { 0 };

        // prefers credits to funds
        let player_address = signer::address_of(player);
        let metadata = option::extract(&mut coin::paired_metadata<CoinType>());
        let credits = friend_pool::get_credit(origin, metadata, player_address);
        if (credits >= collateral) {
            friend_pool::debit(origin, metadata, collateral, player_address);
            // TODO deliver disbursements (cash flow management)
        } else {
            let remains = collateral - credits;
            let coin = coin::withdraw<CoinType>(player, remains);
            let fa = coin::coin_to_fungible_asset(coin);
            friend_pool::hold(origin, fa);
        };

        if (pay_ratio_bps > 0) {
            let payout = collateral * pay_ratio_bps / 10_000;
            friend_pool::credit(origin, metadata, payout, player_address);
        };

        let pool = friend_pool::get_pool_address(origin, metadata);

        event::emit(Dice{
            pool,
            player: player_address,
            collateral,
            is_roll_over,
            expect_hundredths,
            actual_hundredths,
            pay_ratio_bps,
        });
    }

    inline fun get_pay_ratio_bps(is_roll_over: bool, hundredths: u16): u64 {
        let chance_bps = if (is_roll_over) { 10_000 - hundredths } else { hundredths };
        ((10_000 - FEE_BPS) * 10_000 / (chance_bps as u32) as u64)
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

    #[test]
    fun test_pay_ratio() {
        let is_roll_over = true;
        let hundredths = 5025;
        let chance_bps = if (is_roll_over) { 10_000 - hundredths } else { hundredths };
        debug::print(&chance_bps);
        let ratio_bps = (10_000 - FEE_BPS) * 10_000 / chance_bps;
        debug::print(&ratio_bps);
        debug::print(&get_pay_ratio_bps(true, (hundredths as u16)));
    }

    #[test(
        fx = @aptos_framework,
        player = @0xc4fe,
        bettor = @0xc0ffee,
        origin = @0xd2,
    )]
    fun test_dice(fx: &signer, player: &signer, bettor: &signer, origin: &signer) {
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
            place_coin<AptosCoin>(player, origin_address, false, 5025, 10000);

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
            place_coin<AptosCoin>(bettor, origin_address, true, 5025, 10000);

            let credit = friend_pool::get_credit(origin_address, metadata, bettor_address);
            debug::print(&credit);
        };
    }
}