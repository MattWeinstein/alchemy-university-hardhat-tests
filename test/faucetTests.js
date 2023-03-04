const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { MockProvider } = require('ethereum-waffle');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const withdrawAmount = ethers.utils.parseUnits("1", "ether");
    const Faucet = await ethers.getContractFactory('Faucet');
    const provider = ethers.provider;
    const faucet = await Faucet.deploy({ value: withdrawAmount });
    const [owner, notOwner] = await ethers.getSigners();
    return { faucet, owner, withdrawAmount, notOwner, provider };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawls above .1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.withdraw(withdrawAmount)).to.be.rejected;
  });

  it('only the contract owner should be able to call the destroyFaucet function', async function () {
    const { faucet, notOwner } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(notOwner).destroyFaucet()).to.be.rejected;
  });

  it('only the contract owner should be able to call the withdrawAll function', async function () {
    const { faucet, notOwner } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(notOwner).withdrawAll()).to.be.rejected;
  });

  it('the contract should self destruct when called', async function () {
    const { faucet, notOwner, provider } = await loadFixture(deployContractAndSetVariables);
    faucet.destroyFaucet()

    await expect(await provider.getCode(faucet.address)).to.hexEqual('0x');
  });
});