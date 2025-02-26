var express = require("express");
var router = express.Router();
const { Meeting } = require("../model");
const authMiddleware = require("../middlewares/auth");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");

const chime = new AWS.Chime({ region: "us-east-1" });
const alternateEndpoint = process.env.ENDPOINT;
if (alternateEndpoint) {
  chime.createMeeting({ ClientRequestToken: uuid() }, () => {});
  AWS.NodeHttpClient.sslAgent.options.rejectUnauthorized = false;
  chime.endpoint = new AWS.Endpoint(alternateEndpoint);
} else {
  chime.endpoint = new AWS.Endpoint(
    "https://service.chime.aws.amazon.com/console"
  );
}

const meetingCache = {};
const attendeeCache = {};

const log = (message) => {
  console.log(`${new Date().toISOString()} ${message}`);
};

const app = process.env.npm_config_app || "meeting";

// GET meetings list
router.post("/", authMiddleware, async function (req, res, next) {
  Meeting.find({})
    .then((meetings) => {
      res.send(meetings);
    })
    .catch((err) => {
      res.send(err);
    });
});

// getAttendee
router.post("/attendee", async function (req, res, next) {
  const title = req.body.meetingId;
  const attendee = req.body.attendee;

  const attendeeInfo = {
    AttendeeId: attendee,
    Name: attendeeCache[title][attendee],
  };

  res.send(JSON.stringify(attendeeInfo));
});

// POST CHIME one meeting
router.post("/create", async function (req, res, next) {
  let flag = req.body.flag;

  if (flag === 0) {
    //Create meeting
    const temp_room = await Meeting.findOne({ title: req.body.title });

    if (!temp_room) {
      const meeting = new Meeting({
        title: req.body.title,
        maxNum: req.body.maxNum,
        status: req.body.status,
        avgManner: req.body.avgManner,
        avgAge: req.body.avgAge,
        users: req.body.users,
        numOfWoman: req.body.numOfWoman,
        numOfMan: req.body.numOfMan,
        hostImgURL: req.body.hostImgURL,
      });
      meeting.save();

      const title = req.body.title;
      const name = req.body.session;
      const region = "us-east-1";

      if (!meetingCache[title]) {
        meetingCache[title] = await chime
          .createMeeting({
            ClientRequestToken: uuid(),
            MediaRegion: region,
          })
          .promise();
        attendeeCache[title] = {};
      }
      const joinInfo = {
        JoinInfo: {
          Title: title,
          Meeting: meetingCache[title].Meeting,
          Attendee: (
            await chime
              .createAttendee({
                MeetingId: meetingCache[title].Meeting.MeetingId,
                ExternalUserId: uuid(),
              })
              .promise()
          ).Attendee,
        },
      };
      attendeeCache[title][joinInfo.JoinInfo.Attendee.AttendeeId] = name;
      res.send(JSON.stringify(joinInfo));
    } else {
      res.send("이미 존재하는 방 이름 입니다.");
    }
  } else if (flag === 1) {
    // join meeting*
    let isroom = false;
    let perObj = {};

    let temp = Meeting.find(function (err, meeting) {
      meeting.forEach((meet) => {
        if (req.body.title === meet.title) {
          isroom = true;
          perObj = meet;
        }
      });
      if (isroom === true) {
        let arr = [];
        for (let i = 0; i < req.body.groupmember.length; i++) {
          arr.push(req.body.groupmember[i]);
        }

        Meeting.findByIdAndUpdate(
          perObj._id,
          {
            $set: {
              users: perObj.users.concat(arr),
              title: perObj.title,
              maxNum: perObj.maxNum,
              status: req.body.status,
              avgManner: (
                (perObj.avgManner + Number(req.body.avgManner)) /
                2
              ).toFixed(2),
              avgAge: ((perObj.avgAge + req.body.avgAge) / 2).toFixed(2),
              numOfWoman: req.body.numOfWoman,
              numOfMan: req.body.numOfMan,
            },
          },
          (err, u) => {
            console.log(err);
          }
        );
      }
      if (isroom === false) {
        res.send("참가하는 과정에서 오류가 발생했습니다.");
      }
    });
    const title = req.body.title;
    const name = req.body.session;
    const region = "us-east-1";
    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingCache[title].Meeting,
        Attendee: (
          await chime
            .createAttendee({
              MeetingId: meetingCache[title].Meeting.MeetingId,
              ExternalUserId: uuid(),
            })
            .promise()
        ).Attendee,
      },
    };
    attendeeCache[title][joinInfo.JoinInfo.Attendee.AttendeeId] = name;

    res.send(JSON.stringify(joinInfo));
  } else if (flag === 2) {
    // invite meeting
    const title = req.body.title;
    const name = req.body.session;
    const region = "us-east-1";
    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingCache[title].Meeting,
        Attendee: (
          await chime
            .createAttendee({
              MeetingId: meetingCache[title].Meeting.MeetingId,
              ExternalUserId: uuid(),
            })
            .promise()
        ).Attendee,
      },
    };
    attendeeCache[title][joinInfo.JoinInfo.Attendee.AttendeeId] = name;
    res.send(JSON.stringify(joinInfo));
  }
});

router.post("/savemember", function (req, res, next) {
  Meeting.findByIdAndUpdate(
    req.body.room._id,
    {
      $set: {
        title: req.body.room.title,
        maxNum: req.body.room.maxNum,
        status: req.body.room.status,
        avgManner: req.body.room.avgManner,
        numOfWoman: req.body.room.numOfWoman,
        numOfMan: req.body.room.numOfMan,
        users: req.body.member,
      },
    },
    (err, us) => {
      res.send("Success savemember");
    }
  );
});

router.post("/getparticipants", function (req, res, next) {
  Meeting.find(function (err, meeting) {
    meeting.forEach((obj) => {
      if (obj.title === req.body._id) {
        temp = {
          users: obj.users,
          maxNum: obj.maxNum,
          chime_info: attendeeCache[obj.title],
          numOfWoman: obj.numOfWoman,
          numOfMan: obj.numOfMan,
        };
        res.send(temp);
      }
    });
  });
});

router.post("/check", function (req, res, next) {
  let flag = false;
  Meeting.find(function (err, meeting) {
    meeting.forEach((obj) => {
      if (obj.title === req.body.title.title) {
        flag = true;
      }
    });
    if (flag === true) {
      res.send("true");
    } else if (flag === false) {
      res.send("false");
    }
  });
});

router.post("/leavemember", async function (req, res, next) {
  Meeting.find(async function (err, meeting) {
    meeting.forEach((meet) => {
      if (req.body.title === meet.title) {
        isroom = true;
        perObj = meet;
      }
    });
    if (isroom === true) {
      //삭제
      if (perObj.numOfWoman + perObj.numOfMan === 1) {
        Meeting.deleteOne({ _id: perObj._id }).then((result) => {
          res.send("last");
        });
      } else {
        let arr = [];
        for (let i = 0; i < perObj.users.length; i++) {
          if (perObj.users[i].nickname === req.body.user) {
            perObj.users.splice(i, 1);
            i--;
          }
        }

        if (req.body.gender === "woman") {
          perObj.numOfWoman = perObj.numOfWoman - 1;
        }
        if (req.body.gender === "man") {
          perObj.numOfMan = perObj.numOfMan - 1;
        }

        Meeting.findByIdAndUpdate(
          perObj._id,
          {
            $set: {
              users: perObj.users,
              title: perObj.title,
              maxNum: perObj.maxNum,
              status: perObj.status,
              avgManner: perObj.avgManner,
              avgAge: perObj.avgAge,
              numOfWoman: perObj.numOfWoman,
              numOfMan: perObj.numOfMan,
            },
          },
          (err, u) => {
            res.send("success");
          }
        );
      }
    }
    if (isroom === false) {
      res.send("no");
    }
  });
});

router.post("/logs", function (req, res, next) {
  res.redirect(200, "back");
});

router.post("/end", async function (req, res, next) {
  const title = req.body.title;

  await chime
    .deleteMeeting({
      MeetingId: meetingCache[title].Meeting.MeetingId,
    })
    .promise();

  delete meetingCache[title];
  delete attendeeCache[title];
  res.end();
});

module.exports = router;
