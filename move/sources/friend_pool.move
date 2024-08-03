/// Permissionless, anyone can create new friend pools.
/// Why name it friend pool? Because the design based on Moves' Friends!
module apptoss::friend_pool {
    use apptoss::package_manager;
    
    use aptos_framework::fungible_asset::{Metadata};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::signer;

    use std::bcs;
    use std::vector;
    
    /// Create a new friend pool.
    public fun create(origin: &signer, metadata: Object<Metadata>): address {
        let origin_address = signer::address_of(origin);
        let constructor_ref = object::create_named_object(
            &package_manager::get_signer(),
            get_pool_seed(origin_address, metadata));
        let object_signer = object::generate_signer(&constructor_ref);
        let object_address = signer::address_of(&object_signer);
        primary_fungible_store::ensure_primary_store_exists(object_address, metadata);
        object_address
    }

    inline fun get_pool_seed(origin: address, metadata: Object<Metadata>): vector<u8> {
        let seed = vector[];
        vector::append(&mut seed, bcs::to_bytes(&origin));
        vector::append(&mut seed, bcs::to_bytes(&object::object_address(&metadata)));
        seed
    }
}