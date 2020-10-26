var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var StimulusType;
(function (StimulusType) {
  StimulusType["IMAGE"] = "image";
  StimulusType["TEXT"] = "text";
  StimulusType["TEXT_FILE"] = "text_file";
  StimulusType["AUDIO"] = "audio";
  StimulusType["VIDEO"] = "video";
  StimulusType["INSTRUCTION"] = "instruction";
  StimulusType["RESULT"] = "result";
})(StimulusType || (StimulusType = {}));
var FeedbackType;
(function (FeedbackType) {
  FeedbackType["NONE"] = "n";
  FeedbackType["TRUE_OR_FALSE"] = "tf";
  FeedbackType["ALWAYS"] = "a";
  FeedbackType["CHOICE"] = "c";
})(FeedbackType || (FeedbackType = {}));
function splitWithEscapedCharacter(text, splitChar, pairChar) {
  text = text + splitChar;
  var isPairOpen = false;
  var resultArray = [];
  var wordBuffer = [];
  for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
    var char = text_1[_i];
    switch (char) {
      case pairChar:
        isPairOpen = !isPairOpen;
        break;
      case splitChar:
        if (isPairOpen) {
          wordBuffer.push(char);
        } else {
          // add to resultArray and flush wordBuffer
          var completedWord = wordBuffer.join("");
          resultArray.push(completedWord);
          wordBuffer = [];
        }
        break;
      default:
        wordBuffer.push(char);
        break;
    }
  }
  return resultArray;
}
var Parser = /** @class */ (function () {
  function Parser(rawInput) {
    this.rows = rawInput
      .split("\n")
      .map(function (row) {
        var idx = row.indexOf("#");
        if (idx != -1) {
          return row.slice(0, idx);
        } else {
          return row;
        }
      })
      .filter(function (row) {
        return !!row;
      })
      .map(function (row) {
        return row.trim();
      });
    this.stimulusRows = [];
    this.preSequenceRows = [];
    this.mainSequenceRows = [];
    this.postSequenceRows = [];
    this.stimulus = {};
    this.sequences = {};
  }
  Parser.prototype.execute = function () {
    this.splitRowsIntoSection();
    this.parseStimulusRows();
    this.parseAllSequences();
    return this;
  };
  Parser.prototype.detectSectionStartAndEnd = function (keyword) {
    var sectionStartIndex = null;
    var sectionEndIndex = null;
    for (var index = 0; index < this.rows.length; index++) {
      var instruction = this.rows[index];
      var isSectionStartInstruction = instruction == "[" + keyword + "]";
      var isSectionEndInstruction = instruction == "[End" + keyword + "]";
      if (isSectionStartInstruction) {
        sectionStartIndex = index;
      } else if (isSectionEndInstruction) {
        sectionEndIndex = index;
        break;
      }
    }
    return {
      sectionStartIndex: sectionStartIndex,
      sectionEndIndex: sectionEndIndex,
    };
  };
  Parser.prototype.splitSections = function (keyword) {
    var _a = this.detectSectionStartAndEnd(keyword),
      sectionStartIndex = _a.sectionStartIndex,
      sectionEndIndex = _a.sectionEndIndex;
    if (sectionStartIndex === null || sectionEndIndex === null) {
      throw new Error("섹션 파싱에 실패했습니다.");
    } else {
      return this.rows.slice(sectionStartIndex + 1, sectionEndIndex);
    }
  };
  Parser.prototype.getStimulusByIdentifier = function (stimulusIdentifier) {
    var found = this.stimulus[stimulusIdentifier];
    if (found) {
      return found;
    } else {
      throw new Error(
        "Stimulus Identifier " + stimulusIdentifier + " is not valid"
      );
    }
  };
  Parser.prototype.splitRowsIntoSection = function () {
    this.stimulusRows = this.splitSections("Descriptions");
    this.preSequenceRows = this.splitSections("PreSeq");
    this.mainSequenceRows = this.splitSections("MainSeq");
    this.postSequenceRows = this.splitSections("PostSeq");
  };
  Parser.prototype.parseStimulusRow = function (row) {
    var stimulus = {};
    // 띄어쓰기로 row를 분리하여 토큰 array로 저장(큰따옴표(") 내부에 있는 띄어쓰기는 무시))
    // ex) text1 T1 "you have 2 apples" n n
    // => splittedRow : ["text1", "T1", "you have 2 apples", "n", "n"]
    var tokens = splitWithEscapedCharacter(row, " ", '"');
    // 첫 토큰 2개 추출
    var stimulusType = tokens[0],
      identifier = tokens[1];
    stimulus.stimulusType = stimulusType;
    stimulus.identifier = identifier;
    // 나머지 토큰들은 Stimulus Type에 따라 배치가 다르기 때문에 switch 문으로 분리
    var left = tokens.slice(2);
    switch (stimulusType) {
      case StimulusType.IMAGE:
        var filePath = left[0], // ex) 'img/3.png'
          button = left[1];
        stimulus = __assign(__assign({}, stimulus), {
          filePath: filePath,
          button: !!button,
        });
        break;
      case StimulusType.TEXT:
        var content = left[0],
          fontSize = left[1],
          fontColor = left[2];
        stimulus = __assign(__assign({}, stimulus), {
          content: content,
          fontSize: fontSize === "n" ? null : parseInt(fontSize),
          fontColor: fontColor === "n" ? null : fontColor,
        });
        break;
      case StimulusType.TEXT_FILE:
        var filePath = left[0],
          fontSize = left[1],
          fontColor = left[2];
        stimulus = __assign(__assign({}, stimulus), {
          filePath: filePath,
          fontSize: fontSize === "n" ? null : parseInt(fontSize),
          fontColor: fontColor === "n" ? null : fontColor,
        });
        break;
      case StimulusType.AUDIO:
      case StimulusType.VIDEO:
        console.log(left);
        var filePath = left[0];
        stimulus = __assign(__assign({}, stimulus), { filePath: filePath });
        break;
      default:
        throw new Error(
          stimulusType +
            "\uC740 \uC720\uD6A8\uD55C \uC790\uADF9 \uC720\uD615\uC774 \uC544\uB2D9\uB2C8\uB2E4"
        );
    }
    return stimulus;
  };
  Parser.prototype.parseStimulusRows = function () {
    for (var index = 0; index < this.stimulusRows.length; index++) {
      var stimulusRow = this.stimulusRows[index];
      // const stimulus = Stimulus.FromRow(row);
      var stimulus = this.parseStimulusRow(stimulusRow);
      if (stimulus.identifier) {
        this.stimulus[stimulus.identifier] = stimulus;
      } else {
        throw new Error("identifier가 존재하지 않습니다");
      }
    }
  };
  Parser.prototype.parseSequenceRow = function (row) {
    var _this = this;
    var tokens = row.split(" ");
    // 토큰 추출
    var onSetTime = tokens[0], // 0: number(ms)
      identifier = tokens[1], // 1: string
      stimulusDuration = tokens[2], // 2: number(ms) | inf
      choices = tokens[3], // 3: n | comma seperated identifiers(<identifier>,<identifier>)
      choiceDuration = tokens[4], // 4: number(ms) | inf
      answer = tokens[5], // 5: n | index of the choice
      choiceOnsetRelativeToSim = tokens[6], // 6 : number(ms)
      reactionTime = tokens[7], // 7 : number(ms)
      feedbackType = tokens[8], // 8 : n | tf | a | c => none, true or false, always, choice
      feedbackDuration = tokens[9], // 9 : n | number(ms)
      feedback1 = tokens[10], // 10 n | => when feedbackType is tf or a
      feedback2 = tokens[11], // 11 n | => when feedbackType is tf
      test = tokens[12];
    // Process & pack stimulus
    var sequence = {
      onSetTime: +onSetTime,
      stimulus: this.stimulus[identifier] || null,
      stimulusDuration:
        stimulusDuration === "inf" || stimulusDuration === "n"
          ? null
          : +stimulusDuration,
      choices:
        choices === "n"
          ? null
          : choices
              .split(",") // ['s1', 's2']
              .map(function (identifier) {
                return _this.getStimulusByIdentifier(identifier);
              }),
      // [{type: 'image', body: 'img/2.png', font_color: null, font_size: null}, {...}]
      choiceDuration:
        choiceDuration === "inf" || choiceDuration === "n"
          ? null
          : +choiceDuration,
      answer: answer === "n" ? null : +answer,
      choiceOnsetRelativeToSim:
        choiceOnsetRelativeToSim == "inf" || choiceOnsetRelativeToSim == "n"
          ? null
          : +choiceOnsetRelativeToSim,
      reactionTime:
        reactionTime == "n" || reactionTime == "inf" ? null : +reactionTime,
      feedbackType: feedbackType,
      feedbackDuration:
        feedbackDuration == "n" || feedbackDuration == "inf"
          ? null
          : +feedbackDuration,
      test: test == "y",
    };
    switch (feedbackType) {
      case FeedbackType.ALWAYS:
        sequence = __assign(__assign({}, sequence), {
          feedback1:
            feedback1 == "n"
              ? null
              : this.getStimulusByIdentifier(feedback1) || null,
        });
      case FeedbackType.TRUE_OR_FALSE:
        sequence = __assign(__assign({}, sequence), {
          feedback1:
            feedback1 == "n"
              ? null
              : this.getStimulusByIdentifier(feedback1) || null,
          feedback2:
            feedback2 == "n"
              ? null
              : this.getStimulusByIdentifier(feedback2) || null,
        });
        break;
      case FeedbackType.NONE:
      case FeedbackType.CHOICE:
        break;
      default:
        throw new Error(
          feedbackType +
            "\uC740 \uC720\uD6A8\uD55C Feedback Type\uC774 \uC544\uB2D9\uB2C8\uB2E4."
        );
    }
    return sequence;
  };
  Parser.prototype.parseSequenceRows = function (rows) {
    var sequences = [];
    for (var i = 0; i < rows.length; i++) {
      var sequenceRow = rows[i];
      var sequence = this.parseSequenceRow(sequenceRow);
      sequences.push(sequence);
    }
    return sequences;
  };
  Parser.prototype.parseAllSequences = function () {
    this.sequences.pre_sequence = this.parseSequenceRows(this.preSequenceRows);
    this.sequences.main_sequence = this.parseSequenceRows(
      this.mainSequenceRows
    );
    this.sequences.post_sequence = this.parseSequenceRows(
      this.postSequenceRows
    );
  };
  Parser.prototype.json = function () {
    return JSON.stringify(
      { stimulus: this.stimulus, sequences: this.sequences },
      null,
      " "
    );
  };
  return Parser;
})();
module.exports = Parser;
