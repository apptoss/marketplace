#[test_only]
module apptoss::friend_pool_tests {
    use aptos_framework::account;
    use apptoss::friend_pool;
    use apptoss::package_manager;
    use apptoss::test_helpers;
    
    use aptos_framework::fungible_asset::{Self, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::signer;

    #[test(origin = @0xcafe)]
    fun test(origin: &signer) {
        // setup init_module
        package_manager::initialize_for_test(&account::create_signer_for_test(@apptoss));

        let origin_address = signer::address_of(origin);
        let tokens_1 = create_assets(origin);
        let metadata = fungible_asset::metadata_from_asset(&tokens_1);

        let pool_address = friend_pool::create(origin, metadata);
        primary_fungible_store::deposit(pool_address, tokens_1);
        assert!(primary_fungible_store::balance(origin_address, metadata) == 0, 0);
        assert!(primary_fungible_store::balance(pool_address, metadata) == 10000000, 1);
    }

    public fun create_assets(creator: &signer): (FungibleAsset) {
        let tokens_1 = test_helpers::create_fungible_asset_and_mint(creator, b"test1", 10000000);
        (tokens_1)
    }
}