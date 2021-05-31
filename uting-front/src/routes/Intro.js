import React, { useEffect, useState } from "react";
import { Route, Link, Switch, Router, useHistory } from "react-router-dom";
import {
  Button,
  Collapse,
  CardBody,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import "./Intro.css";
import SignIn from "../components/user/SignIn";
import Main from "./Main";
import { Container, Row, Col } from "reactstrap";
import axios from "axios";
import introLog from '../img/인트로유팅로고.png'
const Intro = () => {
  const history = useHistory();
  const [toggleSignIn, setToggleSignIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const onClick = () => {
    history.push({
      pathname: `/signUp`,
    });
  };
  const goMain = () => {
    history.push({
      pathname: `/main`,
    });
  };

  let logout = async(e)=>{
    
    let data={email:sessionStorage.getItem("email")}
    console.log(data)
    const res = await axios.post('http://localhost:3001/users/logout',data)
    if(res.data==="success"){
      sessionStorage.clear();
      window.location.href = "http://localhost:3000/";
    }
    if(res.data==="no"){
      alert("Error")
    }
  }

  const toggleSignInBtn = (e) => {
    setToggleSignIn(!toggleSignIn);
  };
  //컴포넌트가 mount 될 때 실행되는 것
  useEffect(() => {
    if (sessionStorage.getItem("email")) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="IntroContainer">
      {isLoggedIn === false ? (
        <div className="signinclass">
          <img src={introLog}/>
          <span>아직도 만나서 미팅해? 우린 안 만나도 미팅해 !</span>
           <SignIn />
           <span></span>
          <button className="MiddleBtn" onClick={onClick}>
            계정 만들기
          </button>
        </div>
      ) : (
        <div>
          <button onClick={(e)=>logout(e)} className="LogInOutBtn">logout</button>
          <button className="MiddleBtn" onClick={goMain}>
            미팅 즐기러 가기
          </button>
        </div>
      )}
      
      <Container>
       
      </Container>
      <div className="diva" ><Link className="divad" to="/ad">광고 문의</Link></div>
    </div>
  );
};

export default Intro;
