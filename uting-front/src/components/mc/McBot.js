import React, { useState, useEffect, useContext } from "react";
import { Route, Link, Switch, Router } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import McBotImg from "../../img/mc봇.png";
import backImg from "../../img/뒤로가기.svg";
import renewImg from "../../img/새로고침.svg";
import playImg from "../../img/음악재생.svg";
import pauseImg from "../../img/음악정지.png";
import EarInMal from "./EarInMal";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalBody,
  ModalHeader,
  Fade,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Button,
  ButtonGroup,
  ModalFooter,
} from "reactstrap";
import ReactAudioPlayer from "react-audio-player";
import socketio from "socket.io-client";
import { alignItems, paddingLeft } from "styled-system";
const Box = styled.div`
  border: 2px solid rgb(255, 255, 255);
  border-radius: 7px;
  margin-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  background: linear-gradient(to bottom, #ffd5d5, #ddf5ff);
  width: 200px;
  height: 200px;
`;

const HashTag = styled.span`
  background-color: #f6cdcf;
  border-radius: 5px;
  font-size: 18px;
  margin-left: 4%;
  padding-left: 1%;
  padding-right: 3%;
  padding-bottom: 1%;
  padding-top: 2%;
  font-family: "Jua";
`;
const McBot = ({
  participantsSocketIdList,
  currentSocketId,
  participants,
  isTurn,
  nextTurnFlag,
  gameStartFlag,
  gameTurn,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contentFade, setContentFade] = useState(false);
  const [number, setNumber] = useState("");
  const [content, setContent] = useState("");
  const [musicpath, setMusicpath] = useState("");
  const [gameStart, setGameStart] = useState(gameStartFlag);

  const toggle = (e) => {
    setDropdownOpen((prevState) => !prevState);
    if (dropdownOpen === false) {
      setContentFade(false);
    }
  };

  let back = (e) => {
    setContentFade(false);
    setDropdownOpen(true);
  };

  let getGame = async (e) => {
    let data = {
      type: "game",
    };
    const res = await axios.post("http://localhost:3001/mcs/list", data);

    //랜덤값생성
    let index = Math.floor(Math.random() * res.data.length);
    setContent(res.data[index]);
  };

  let getTopic = async (e) => {
    let data = {
      type: "conversation",
    };
    const res = await axios.post("http://localhost:3001/mcs/list", data);
    //랜덤값생성
    let index = Math.floor(Math.random() * res.data.length);
    setContent(res.data[index]);
  };

  let getMusicName = (e) => {
    const socket = socketio.connect("http://localhost:3001");
    if (e === 1) {
      console.log(e);
      console.log(participantsSocketIdList);
      socket.emit("musicplay", {
        socketIdList: participantsSocketIdList,
        src: "/music/신남/SellBuyMusic신남1.mp3",
      });
    }
    if (e === 2) {
      socket.emit("musicplay", {
        socketIdList: participantsSocketIdList,
        src: "/music/설렘/SellBuyMusic설렘1.mp3",
      });
    }
    if (e === 3) {
      socket.emit("musicplay", {
        socketIdList: participantsSocketIdList,
        src: "/music/잔잔/SellBuyMusic잔잔1.mp3",
      });
    }
  };

  let pause = () => {
    const socket = socketio.connect("http://localhost:3001");
    socket.emit("musicpause", { socketIdList: participantsSocketIdList });
  };

  let play = () => {
    const socket = socketio.connect("http://localhost:3001");
    socket.emit("replay", { socketIdList: participantsSocketIdList });
  };

  const FadeToggle = (e) => {
    setNumber(e);
    setContentFade(!contentFade);
    if (e === 1 && contentFade === false) {
      getGame();
    }
    if (e === 2 && contentFade === false) {
      getTopic();
    }
    if (e === 3 && contentFade === false) {
      //음악
      console.log(participantsSocketIdList);
      setContent("");
    }
    if (e === 4 && contentFade === false) {
      //실시간게임
    }
  };

  useEffect(() => {
    setGameStart(gameStartFlag);
    if (gameStartFlag) {
      setContentFade(true);
      setNumber(4);
    }
  }, [gameStartFlag]);

  const [modal, setModal] = useState(false);
  const toogleERR = () => setModal(!modal);

  return (
    <div>
      <Modal isOpen={modal} toggle={toogleERR}>
        <ModalHeader toggle={toogleERR}>Modal title</ModalHeader>
        <ModalBody>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toogleERR}>
            Do Something
          </Button>{" "}
          <Button color="secondary" onClick={toogleERR}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          caret
          style={{
            width: "15%",
            backgroundColor: "transparent",
            border: "0px",
          }}
        >
          <img src={McBotImg} style={{ width: "80%" }} />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={(e) => FadeToggle(1)}>게임 추천</DropdownItem>
          <DropdownItem onClick={(e) => FadeToggle(2)}>대화 추천</DropdownItem>
          <DropdownItem onClick={(e) => FadeToggle(3)}>음악 재생</DropdownItem>
          <DropdownItem onClick={(e) => FadeToggle(4)}>
            실시간 게임
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Fade in={contentFade} tag="h5" className="mt-3">
        <Box>
          <img
            onClick={(e) => back(e)}
            src={backImg}
            style={{ width: "12%" }}
          ></img>
          {number === 1 ? (
            <>
              <img
                onClick={(e) => getGame(e)}
                src={renewImg}
                style={{ width: "12%", marginLeft: "130px" }}
              ></img>
            </>
          ) : number === 2 ? (
            <img
              onClick={(e) => getTopic(e)}
              src={renewImg}
              style={{ width: "12%", marginLeft: "130px" }}
            ></img>
          ) : number === 3 ? (
            <div>
              <div>
                <HashTag onClick={(e) => getMusicName(1)}>#신남</HashTag>
                <HashTag onClick={(e) => getMusicName(2)}>#설렘</HashTag>
                <HashTag onClick={(e) => getMusicName(3)}>#잔잔</HashTag>
              </div>
              <div style={{ marginTop: "20%", marginLeft: "20%" }}>
                <span onClick={(e) => play()}>
                  <img style={{ width: "30%" }} src={playImg}></img>
                </span>
                <span onClick={(e) => pause()}>
                  <img style={{ width: "30%" }} src={pauseImg}></img>
                </span>
              </div>
            </div>
          ) : number === 4 ? (
            <div style={{ alignItems: "center" }}>
              <ButtonGroup vertical>
                <EarInMal
                  participantsSocketIdList={participantsSocketIdList}
                  currentSocketId={currentSocketId}
                  participants={participants}
                  isTurn={isTurn}
                  nextTurnFlag={nextTurnFlag}
                  gameStartFlag={gameStart}
                  gameTurn={gameTurn}
                />
                {!gameStart ? (
                  <>
                    <Button
                      outline
                      color="secondary"
                      disabled
                      style={{ border: 0 }}
                    >
                      왕게임
                    </Button>
                    <Button
                      outline
                      color="secondary"
                      disabled
                      style={{ border: 0 }}
                    >
                      라이어게임
                    </Button>
                    <Button
                      outline
                      color="secondary"
                      disabled
                      style={{ border: 0 }}
                    >
                      ...
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </ButtonGroup>
            </div>
          ) : (
            ""
          )}
          <div style={{ marginTop: "50px", marginLeft: "50px" }}>{content}</div>
        </Box>
      </Fade>
    </div>
  );
};
export default McBot;
