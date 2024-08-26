#[test_only]
module apptoss::test_friend_pool {
    use apptoss::friend_pool;
    use apptoss::package_manager;
    use apptoss::test_helpers;
    
    use aptos_framework::account;
    use aptos_framework::fungible_asset::{Self, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::signer;

    #[test(
        player = @0xc4fe,
        origin = @0xd2,
    )]
    fun test(origin: &signer, player: &signer) {
        // init_module equivalent
        package_manager::initialize_for_test(&account::create_signer_for_test(@apptoss));

        let origin_address = signer::address_of(origin);
        let tokens_1 = create_assets(origin);
        let metadata = fungible_asset::metadata_from_asset(&tokens_1);

        friend_pool::create_pool(origin, metadata);
        let pool_address = friend_pool::get_pool_address(origin_address, metadata);
        friend_pool::hold(origin_address, tokens_1);
        assert!(primary_fungible_store::balance(origin_address, metadata) == 0, 0);
        assert!(primary_fungible_store::balance(pool_address, metadata) == 10_000_000, 1);

        let reward = friend_pool::hand(origin_address, metadata, 1);
        assert!(primary_fungible_store::balance(pool_address, metadata) == 9_999_999, 1);
        primary_fungible_store::deposit(pool_address, reward);
        assert!(primary_fungible_store::balance(pool_address, metadata) == 10_000_000, 1);

        let player_address = signer::address_of(player);
        friend_pool::credit(origin_address, metadata, 1111, player_address);
        let credited = friend_pool::get_credit(origin_address, metadata, player_address);
        assert!(credited == 1111, 1);

        assert!(primary_fungible_store::balance(player_address, metadata) == 0, 1);
        friend_pool::realize(player, origin_address, metadata, 11);
        assert!(primary_fungible_store::balance(player_address, metadata) == 11, 1);
        let credited = friend_pool::get_credit(origin_address, metadata, player_address);
        assert!(credited == 1100, 1);
        assert!(primary_fungible_store::balance(pool_address, metadata) == 9_999_989, 1);
    }

    public fun create_assets(creator: &signer): (FungibleAsset) {
        let tokens_1 = test_helpers::create_fungible_asset_and_mint(creator, b"test1", 10_000_000);
        (tokens_1)
    }
}