"use strict";
// prepopulateSlackComments.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var admin = require("firebase-admin");
var fs = require("fs");
var csv = require("csv-parser");
// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});
var db = admin.firestore();
// Path to your CSV file
var filePath = './comments.csv';
function uploadSlackComments() {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        var _this = this;
        return __generator(this, function (_a) {
            results = [];
            // Read the CSV file
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', function (row) {
                results.push({ courseCode: row[Object.keys(row)[0]], comment: row[Object.keys(row)[1]] });
            })
                .on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, results_1, _a, courseCode, comment, courseRef, courseSnapshot, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log("Found ".concat(results.length, " comments."));
                            _i = 0, results_1 = results;
                            _b.label = 1;
                        case 1:
                            if (!(_i < results_1.length)) return [3 /*break*/, 7];
                            _a = results_1[_i], courseCode = _a.courseCode, comment = _a.comment;
                            if (!courseCode) return [3 /*break*/, 6];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            courseRef = db.collection('courses').doc(courseCode);
                            return [4 /*yield*/, courseRef.get()];
                        case 3:
                            courseSnapshot = _b.sent();
                            if (!courseSnapshot.exists) {
                                console.warn("Course ".concat(courseCode, " not found, skipping."));
                                return [3 /*break*/, 6];
                            }
                            // Update slack_comments field (only if comment exists)
                            return [4 /*yield*/, courseRef.update({
                                    slack_comments: comment || ""
                                })];
                        case 4:
                            // Update slack_comments field (only if comment exists)
                            _b.sent();
                            console.log("Updated slack_comments for course ".concat(courseCode));
                            return [3 /*break*/, 6];
                        case 5:
                            err_1 = _b.sent();
                            console.error("Error updating course ".concat(courseCode, ": ").concat(err_1));
                            return [3 /*break*/, 6];
                        case 6:
                            _i++;
                            return [3 /*break*/, 1];
                        case 7:
                            console.log('All slack comments updated!');
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
uploadSlackComments()["catch"](console.error);
