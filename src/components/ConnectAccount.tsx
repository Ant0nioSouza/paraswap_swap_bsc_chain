import { useState, useEffect } from "react"; // Importando corretamente useState e useEffect
import Web3 from "web3";
import ErrorMessage from "./ErrorMessage";
import { Box, Button, MenuItem, Select, TextField } from "@material-ui/core";
import styled from "styled-components";


// Define network details
const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

const changeNetwork = async ({ networkName, setError }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (err) {
    setError(err.message);
  }
};


const sendTransaction = async () => {
  if (!priceRoute) {
    setError("Por favor, obtenha o preço primeiro");
    return;
  }

  try {
    const transactionParameters = {
      from: userAddress,
      to: priceRoute.to,  // O endereço de destino
      value: priceRoute.value, // O valor em WEI a ser enviado
      gasPrice: priceRoute.gasPrice, // Preço do gas
      gas: priceRoute.gas, // Limite de gas
      data: priceRoute.data, // Dados para a transação
    };

    // Enviando a transação com Web3
    console.log("ANTES DE CHAMAR O WEB3")
    const transactionHash = await web3.eth.sendTransaction(transactionParameters);
    console.log('Transação enviada:', transactionHash);
  } catch (err) {
    console.error('Erro ao enviar a transação:', err);
    setError("Falha ao enviar a transação");
  }
};



export default function ConnectAccount({ onAccountChange }) {
  const [error, setError] = useState("");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        onAccountChange(accounts[0]); // Passando o endereço para o Main.tsx
      } catch (err) {
        setError("Connection failed");
      }
    } else {
      setError("Please install MetaMask!");
    }
  };


  const StyledButton = styled(Button)`
  background-color: #f6851a;
  color: #fff;
  &:hover {
    background-color: #e4761b;
  }
`;

  // Detect account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        const newAccount = accounts[0] || "";
        setAccount(newAccount);
        onAccountChange(newAccount); // Atualizando o endereço ao mudar
      });
    }
  }, [onAccountChange]);

  return (
    <div className="connect-account w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-800 p-4">
      </div>
      <main className="p-6">

        <div className="mt-4">
          <StyledButton
            onClick={connectWallet}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "CONNECT TO METAMASK"}
          </StyledButton>
          <ErrorMessage message={error} />
        </div>
      </main>
    </div>
  );
}
