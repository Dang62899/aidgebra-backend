const nodemailer = require("nodemailer")
const mg = require('nodemailer-mailgun-transport')

const sendMail = async (opt = {}) => {
    try{
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              type: "",
              user: "",
              clientId: "",
              clientSecret: "",
              refreshToken: "",
              accessToken:  "",
            },
        });

        const mailOpts = {
            from : `aidgebra.als@gmail.com`,
            to : opt.to,
            subject : opt.subject || "",
            html : opt.text || opt.html
        }

        if(opt.attachments) mailOpts.attachments = opt.attachments

        const result = await transport.sendMail(mailOpts)

        console.log(result)
        return ({status: true})

    }
    catch(error){
        console.log(error)
        return ({status :false,error})
    }
}

module.exports = sendMail
