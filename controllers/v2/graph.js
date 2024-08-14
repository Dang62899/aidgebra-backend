const mongoose = require("mongoose");
const {
    postTestAttemptV2,
} = require("../../models/v2/posttest_attempt.schema");

const graphController = {
    incorrectAnswerConcept: async (req, res) => {
        try {
            if(!req.query.class) throw "Please select class"

            const entry = await postTestAttemptV2.aggregate([
                {
                    $unwind : "$result"
                },
                {
                    $lookup : {
                        from : "v2students",
                        localField : "studentId",
                        foreignField : "_id",
                        as : "studentId"
                    }
                },
                {
                    $unwind : "$studentId"
                },
                {
                    $match : {
                        "studentId.classId" : mongoose.Types.ObjectId(req.query.class)
                    }
                },
                {
                    $project : {
                        "result": {
                            "conceptId" : 1,
                            "conceptName": 1,
                            "correctAnswers": 1,
                            "incorrectAnswers": {
                                $cond: { 
                                    if : {
                                        $gte: [ "$result.correctAnswers", 1 ]
                                    },
                                    then : {
                                        $subtract: [ 4, "$result.correctAnswers" ] 
                                    },
                                    else : 0
                                }
                            },
                            "mastery": 1,
                            "id" : 1
                        }
                    }
                },
                {
                    $group : {
                        _id : "$result.conceptId",
                        incorrectAnswers : {
                            $sum : "$result.incorrectAnswers"
                        },
                        correctAnswers : {
                            $sum : "$result.correctAnswers"
                        },
                    }
                }, 
                {
                    $lookup : {
                        from : "v2concepts",
                        localField : "_id",
                        foreignField : "_id",
                        as : "_id"
                    }
                },
                {
                    $unwind : "$_id"
                }
            ])

            const entry_count = await postTestAttemptV2.find({}).count()

            return res.json({status:true, data: entry, totalAttempts : entry_count})
        } catch (error) {
            console.log(error);
            return res.json({ status: false, error });
        }
    },
    incorrectAnswerQuestion : async(req, res) => {
        try{
            const entry = await postTestAttemptV2.aggregate([
                {
                    $unwind : "$questions"
                },
                {
                    $lookup : {
                        from : "v2students",
                        localField : "studentId",
                        foreignField : "_id",
                        as : "studentId"
                    }
                },
                {
                    $unwind : "$studentId"
                },
                {
                    $match : {
                        "studentId.classId" : mongoose.Types.ObjectId(req.query.class)
                    }
                },
                {
                    $group : {
                        _id : "$questions.questionId",
                        inCorrectAnswers: {
                            $sum: {
                                $cond: [{ 
                                    $eq: ["$questions.isCorrect", false] 
                                }, 1, 0 ]
                            }
                        }
                    }
                },
                {
                    $lookup : {
                        from : "v2posttest_questions",
                        localField : "_id",
                        foreignField : "_id",
                        as : "_id"
                    }
                },
                {
                    $unwind : "$_id"
                }
            ])

            return res.json({status:true, data: entry})
        }
        catch(error){
            console.log(error)
            return res.json({status: false, error})
        }
    }
};

module.exports = graphController;
