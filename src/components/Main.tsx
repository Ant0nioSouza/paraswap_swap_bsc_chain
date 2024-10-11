import { useState } from "react";
import ConnectAccount from "./ConnectAccount";
import Swap from "./CustomSwap"; // Certifique-se de que isso esteja correto
import styled from "styled-components";
import { Paper } from "@material-ui/core";
import paraswapLogo from "../paraswapLogo.png";

const MainCtn = styled.div``;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 10px 10px 0 0;
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;
const TitleCtn = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  padding: 10px 30px;

  & > h1,
  h2 {
    line-height: 0;
  }

  & > h1 {
    font-size: 2em;
  }

  & > h2 {
    font-size: 10px;
    display: flex;
    align-items: center;
    column-gap: 5px;
  }
`;
const SwapCtn = styled(Paper)`
  width: 400px;
  height: 300px;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 30px;
  background: white;
`;

export default function Main() {
  const [userAddress, setUserAddress] = useState(""); // Estado para armazenar o endereço do usuário
  const [amountValue, setAmountValue] = useState("1"); // Estado para armazenar o valor do amount

  const handleAccountChange = (address) => {
    setUserAddress(address); // Atualiza o endereço da conta quando ele muda
  };

  return (
    <MainCtn>
      <Header>
        <ConnectAccount onAccountChange={handleAccountChange} />
      </Header>
      <Body>
        <TitleCtn elevation={3}>
          <h1>PBWS Swap</h1>
          <h2>
            <span>Powered by</span>
            <img src={paraswapLogo} height={20} alt="" />
          </h2>
        </TitleCtn>
        <SwapCtn elevation={3}>
          <Swap
            srcToken={"0x55d398326f99059ff775485246999027b3197955"}
            srcDecimals={18}
            destToken={"0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"}
            amount={amountValue} // Passa amountValue para o Swap
            userAddress={userAddress}
            network={56}
            onAmountChange={setAmountValue} // Passa a função para atualizar amountValue
          />
        </SwapCtn>
      </Body>
    </MainCtn>
  );
}
