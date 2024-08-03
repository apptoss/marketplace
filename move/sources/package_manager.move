module apptoss::package_manager {
    use aptos_framework::object::{Self, ExtendRef};

    friend apptoss::friend_pool;
    
    struct PermissionController has key {
        generator_extend_ref: ExtendRef
    }

    /// This function is invoked only when this package is deployed the first time, and not during an upgrade.
    fun init_module(package_signer: &signer) {
        let generator_extend_ref = object::generate_extend_ref(
            &object::create_named_object(package_signer, b"Generator")
        );
        move_to(
            package_signer,
            PermissionController {
                generator_extend_ref
            }
        )
    }

    /// Can be called by friended modules to obtain the generator signer.
    public(friend) fun get_signer(): signer acquires PermissionController {
        let controller = borrow_global_mut<PermissionController>(@apptoss);
        let generator_signer = object::generate_signer_for_extending(&controller.generator_extend_ref);
        generator_signer
    }

    #[test_only]
    public fun initialize_for_test(deployer: &signer) {
        let deployer_addr = std::signer::address_of(deployer);
        if (!exists<PermissionController>(deployer_addr)) {
            let generator_extend_ref = object::generate_extend_ref(
                &object::create_named_object(deployer, b"Generator")
            );
            move_to(
                deployer,
                PermissionController {
                    generator_extend_ref
                }
            )
        }
    }
}