module apptoss::coinflip {
    use aptos_framework::randomness;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{AptosCoin};
    use std::fixed_point32;
    use std::fixed_point32::multiply_u64;

    const FLIP_MULTIPLIER: u64 = 2;
    const FLIP_FEE_BPS: u64 = 100;

    #[event]
    struct FlipEvent has drop, store {
        flip_result: u64,
        is_win: bool,
    }

    #[randomness]
    entry fun place(player: &signer, outcome: bool, aptCollateral: u64) {
        let flip_result = randomness::u64_range(0, 2);
        let is_win = (flip_result == 1 && outcome) || (flip_result == 0 && !outcome);

        let fee_multiplier = fixed_point32::create_from_rational(10000 + FLIP_FEE_BPS, 10000);
        let amount_with_fees = multiply_u64(aptCollateral, fee_multiplier);
        // transfer bet amount + fees to the vault
        // TODO manage vault address
        coin::transfer<AptosCoin>(player, @apptoss, amount_with_fees);
        
        let pay_ratio = if (is_win) { FLIP_MULTIPLIER } else { 0 };
        if (pay_ratio > 0) {
            // double bet amount
            let payout = aptCollateral * pay_ratio;
            // rewards player
            // TODO manage vault signer
            coin::transfer<AptosCoin>(player, @apptoss, payout);
        };

        event::emit(FlipEvent{
            flip_result,
            is_win,
        });
    }

    #[test(fx = @aptos_framework, player = @0x42)]
    fun test(fx: &signer, player: &signer) {
        randomness::initialize_for_testing(fx);
        place(player, true, 1337);
    }
}
