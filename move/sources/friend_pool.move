/// Permissionless, anyone can create new friend pools.
/// Why name it friend pool? Because the design based on Moves' Friends!
module apptoss::friend_pool {
    use apptoss::package_manager;
    
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::signer;
    use aptos_std::smart_table::{Self, SmartTable};

    use std::bcs;
    use std::vector;

    /*
     * A list of friends.
     */

    friend apptoss::coinflip;

    /*
     * Implementation.
     */

    struct FriendPool has key {
        extend_ref: ExtendRef,
        credits: SmartTable<address, u64>, // TODO choose the appropriate size of amounts
    }
    
    /// Create a new friend pool.
    public entry fun create(origin: &signer, metadata: Object<Metadata>) {
        let origin_address = signer::address_of(origin);
        
        let constructor_ref = object::create_named_object(
            &package_manager::get_signer(),
            get_pool_seed(origin_address, metadata));
        let object_address = object::address_from_constructor_ref(&constructor_ref);
        
        let object_signer = object::generate_signer(&constructor_ref);
        primary_fungible_store::ensure_primary_store_exists(object_address, metadata);
        move_to(
            &object_signer,
            FriendPool {
                extend_ref: object::generate_extend_ref(&constructor_ref),
                credits: smart_table::new(),
            }
        );
    }

    inline fun get_pool_seed(origin: address, metadata: Object<Metadata>): vector<u8> {
        let seed = vector[];
        vector::append(&mut seed, bcs::to_bytes(&origin));
        vector::append(&mut seed, bcs::to_bytes(&object::object_address(&metadata)));
        seed
    }

    /// Hold assets in the friend pool.
    public(friend) fun hold(origin: address, asset: FungibleAsset) {
        let to_pool = get_pool_address(origin, fungible_asset::asset_metadata(&asset));
        // deliver disbursements (cash flow management)
        primary_fungible_store::deposit(to_pool, asset);
    }

    /// Hand assets out of the friend pool.
    public(friend) fun hand(origin: address, metadata: Object<Metadata>, amount: u64): FungibleAsset acquires FriendPool {
        let pool = borrow_global_mut<FriendPool>(get_pool_address(origin, metadata));
        let pool_signer = &object::generate_signer_for_extending(&pool.extend_ref);
        let fa = primary_fungible_store::withdraw(pool_signer, metadata, amount);
        fa
    }

    /// Credit virtual funds to an account.
    public(friend) fun credit(origin: address, metadata: Object<Metadata>, amount: u64, destination: address) acquires FriendPool {
        let pool = borrow_global_mut<FriendPool>(get_pool_address(origin, metadata));
        let last_credit = *smart_table::borrow_with_default(&pool.credits, destination, &0);
        last_credit = last_credit + amount;
        smart_table::upsert(&mut pool.credits, destination, last_credit);
    }

    public entry fun realize(redeemer: &signer, origin: address, metadata: Object<Metadata>, amount: u64) acquires FriendPool {
        let redeemer_address = signer::address_of(redeemer);
        let pool = borrow_global_mut<FriendPool>(get_pool_address(origin, metadata));
        
        let last_credit = *smart_table::borrow(&pool.credits, redeemer_address);
        assert!(last_credit >= amount, 0);
        last_credit = last_credit - amount;
        smart_table::upsert(&mut pool.credits, redeemer_address, last_credit);

        let pool_signer = &object::generate_signer_for_extending(&pool.extend_ref);
        primary_fungible_store::transfer(pool_signer, metadata, redeemer_address, amount);
    }

    #[view]
    public fun get_credit(origin: address, metadata: Object<Metadata>, destination: address): u64 acquires FriendPool {
        let pool = borrow_global<FriendPool>(get_pool_address(origin, metadata));
        *smart_table::borrow_with_default(&pool.credits, destination, &0)
    }

    #[view]
    public fun get_pool_address(origin: address, metadata: Object<Metadata>): address {
        let signer = &package_manager::get_signer();
        let signer_address = signer::address_of(signer);
        object::create_object_address(&signer_address, get_pool_seed(origin, metadata))
    }

    /*
     * Testify
     */

    #[test_only]
    friend apptoss::friend_pool_tests;
}