## Move

```shell
cd ./move

# Run unit tests
aptos move test --dev

# At root
cd ..

# Publish modules
bun move:publish

# Upgrade modules
bun move:upgrade
```

We cannot run move script with randomness, cause we set entry function in the module to be private to prevent test and abort attack. 
