#!/bin/sh

set -e

source .env

echo "##### Upgrade module #####"

CONTRACT_ADDRESS=$(cat contract_address.txt)

aptos move upgrade-object-package \
  --object-address $CONTRACT_ADDRESS \
  --named-addresses apptoss=$CONTRACT_ADDRESS \
  --profile $PUBLISHER_PROFILE \
  --assume-yes
