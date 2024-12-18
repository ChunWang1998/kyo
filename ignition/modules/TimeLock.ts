import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MINIMUM_DELAY = 60; // 1 min in seconds
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default buildModule("TimeLock", (m) => {
    const timeLock = m.contract("TimeLock", [
        MINIMUM_DELAY,          // minDelay
        [ZERO_ADDRESS],         // proposers array (can be updated later)
        [ZERO_ADDRESS],         // executors array (can be updated later)
    ]);

    return { timeLock };
});
