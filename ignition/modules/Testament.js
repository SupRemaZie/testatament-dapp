import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestamentModule = buildModule("TestamentModule", (m) => {
  const heir = m.getParameter("heir", "0xHeirAddressHere");
  const notary = m.getParameter("notary", "0xNotaryAddressHere");
  const testamentHash = m.getParameter("testamentHash", "bafkreiclwfz6uzvturnq2zp2g2ovoxlur57pormqyw7555ybpd6rwhkrmi");
  const unlockTime = m.getParameter("unlockTime", Math.floor(Date.now() / 1000) + 60); // 1minute

  const testament = m.contract("Testament", [heir, notary, testamentHash, unlockTime]);

  return { testament };
});

export default TestamentModule;
