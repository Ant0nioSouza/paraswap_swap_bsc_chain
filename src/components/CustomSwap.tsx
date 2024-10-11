import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, MenuItem, Select, TextField } from "@material-ui/core";
import tokensList from "../tokensList.json";
import styled from "styled-components";
import { BigNumber } from "bignumber.js";
import { ethers } from 'ethers';

// Exemplo de lista de tokens
const useTokensList = () => {
  return tokensList.tokens;
};

const StyledTokenInput = styled(Box)`
  display: flex;
  column-gap: 12px;
  margin: 20px 0;
`;

interface ParaswapTransactionProps {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  amount: number;
  userAddress: string;
  network: number;
}

const TokenInput: React.FC<{
    tokenAddress: string;
    amount: string | undefined;
    onTokenChange: (address: string) => void;
    onAmountChange?: (amount: string) => void;
  }> = ({ tokenAddress, amount, onTokenChange, onAmountChange }) => {
    const tokens = useTokensList();
  
    return (
      <StyledTokenInput>
        <Select value={tokenAddress} onChange={(event) => onTokenChange(event.target.value)}>
          {tokens.map((token) => (
            <MenuItem key={token.address} value={token.address}>
              <img src={token.logoURI} alt={token.name} height={40} width={40} />
              {token.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          value={amount}
          onChange={onAmountChange ? (evt) => onAmountChange(evt.target.value) : undefined}
          style={{ width: "84%" }}
          variant="outlined"
        />
      </StyledTokenInput>
    );
  };
  
  const ERC20_ABI = [
    // Transfer event
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "from", type: "address" },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Transfer",
      type: "event",
    },
    // Approval event
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "owner", type: "address" },
        { indexed: true, internalType: "address", name: "spender", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
      ],
      name: "Approval",
      type: "event",
    },
    // approve function
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    // balanceOf function
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    // transfer function
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    // transferFrom function
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  
  

const ParaswapTransaction: React.FC<ParaswapTransactionProps> = ({
  srcToken,
  srcDecimals,
  destToken,
  amount,
  userAddress,
  network,
}) => {
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceRoute, setPriceRoute] = useState<any>(null);
  const [srcTokenAddress, setSrcTokenAddress] = useState<string>(srcToken);
  const [destTokenAddress, setDestTokenAddress] = useState<string>(destToken);
  const [amountValue, setAmountValue] = useState<string>(amount.toString());

  // Correção na função useEffect para garantir que os tokens sejam atualizados corretamente
  useEffect(() => {
    console.log("Atualizando os tokens...");
    setSrcTokenAddress(srcTokenAddress); // Atualiza o token de origem
    setDestTokenAddress(destTokenAddress); // Atualiza o token de destino
  }, [srcTokenAddress, destTokenAddress]); // Adicione srcTokenAddress e destTokenAddress como dependências
  

  // Remova os estados locais srcTokenAddress e destTokenAddress
  // Use srcToken e destToken diretamente no código onde apropriado


  const approveToken = async (tokenAddress: string, spenderAddress: string, amount: string, userAddress: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(userAddress);
  
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      
      // Certifique-se de que o spenderAddress seja o correto (provavelmente o TokenTransferProxy)
      const tx = await tokenContract.approve(spenderAddress, amount);
      console.log('Transaction hash:', tx.hash);
  
      await tx.wait();
      console.log('Token approved:', tx.hash);
    } catch (error) {
      console.error('Error approving token:', error);
    }
  };
  
  
  

  const getPrice = async () => {
    try {
      // Converter o valor de amountValue para WEI
      const amountInWei = (new BigNumber(amountValue).multipliedBy(new BigNumber(10).pow(srcDecimals))).toString();
  
      const response = await axios.get("https://api.paraswap.io/prices", {
        params: {
          srcToken: srcTokenAddress,
          srcDecimals: srcDecimals.toString(),
          destToken: destTokenAddress,
          amount: amountInWei, // Use amount em WEI
          network,
        },
      });
      setPriceRoute(response.data);


      return response.data;
    } catch (err) {
      console.error("Erro ao obter preço:", err);
    }
  };

  useEffect(() => {
    // Chama getPrice sempre que amountValue mudar
    if (amountValue) {
      getPrice();
    }
  }, [amountValue, srcTokenAddress, destTokenAddress, srcDecimals, network]); // Adicione dependências conforme necessário

  const buildTransaction = async () => {
    if (!priceRoute) {
      setError("Por favor, obtenha o preço primeiro");
      return;
    }
  
    try {
      console.log("Src token is ", srcTokenAddress)
      console.log("Dest token is", destTokenAddress)

        if (srcTokenAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
          await approveToken(srcTokenAddress, priceRoute.priceRoute.tokenTransferProxy, new BigNumber(amountValue).multipliedBy(new BigNumber(10).pow(srcDecimals)).toString(), userAddress);

        console.log("Aprovado!")

      const payloadPost = {
        srcToken: srcTokenAddress,
        srcDecimals,
        destToken: destTokenAddress,
        destDecimals: srcDecimals,
        srcAmount: new BigNumber(amountValue)
          .multipliedBy(new BigNumber(10).pow(srcDecimals))
          .toString(), // Enviando o valor em WEI
        userAddress,
        destAmount: priceRoute.priceRoute.destAmount, // Convertendo destAmount de WEI para unidade
        ...priceRoute,
      };
  
      console.log(payloadPost);
  
      const response = await axios.post(
        `https://api.paraswap.io/transactions/${network}`,
        payloadPost
      );
      setTransactionResult(response.data);
      
      console.log("Value is ", response.data.value)

      // Parâmetros da transação
      const transactionParameters = {
        from: userAddress,
        to: response.data.to, // O endereço de destino
        value: response.data.value, // O valor em WEI a ser enviado
        gasPrice: response.data.gasPrice, // Preço do gas
        gas: response.data.gas, // Limite de gas
        data: response.data.data, // Dados para a transação
      };
  
      // Usando window.ethereum para enviar a transação
      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
  
      console.log("Transação enviada:", transactionHash);
    } catch (err) {
      console.error("Erro ao construir e enviar a transação:", err);
      const errorMessage =
        err.response?.data?.error || "Erro desconhecido ao construir a transação";
      alert(`${errorMessage}`);
    }
  };
  
  


  return (
    <div>
      <TokenInput
        tokenAddress={srcTokenAddress}
        amount={amountValue}
        onTokenChange={setSrcTokenAddress}
        onAmountChange={setAmountValue}
      />
      <TokenInput
        tokenAddress={destTokenAddress}
        amount={priceRoute ? new BigNumber(priceRoute.priceRoute.destAmount).dividedBy(new BigNumber(10).pow(srcDecimals)).toString() : undefined}
        onTokenChange={setDestTokenAddress}
      />


      {/* Removido o botão "Obter Preço" */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={buildTransaction}
        disabled={userAddress.length < 4}
      >
        Swap
      </Button>


      {error && <div style={{ color: "red" }}>{alert(error)}</div>}
    </div>
  );
  
};

export default ParaswapTransaction;
