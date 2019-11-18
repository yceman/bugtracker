const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const { promisify } = require('util')
const sgMail = require('@sendgrid/mail')

const GoogleSpreadsheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')

//Configurations
const docId = ''
const worksheetIndex = 0
const sendGridKey = ''

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))
/* console.log(path.resolve(__dirname, 'views')) */

app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (request, response) => {
    response.render('home')
})

app.post('/', async(request, response) => {
    try {
        const doc = new GoogleSpreadsheet(docId)
        await promisify(doc.useServiceAccountAuth)(credentials)
        console.log('planilha aberta')
        const info = await promisify(doc.getInfo)()
        const worksheet = info.worksheets[worksheetIndex]
        await promisify(worksheet.addRow)({
            name: request.body.name,
            email: request.body.email,
            issueType: request.body.issueType,
            howToReproduce: request.body.howToReproduce,
            expectedOutput: request.body.expectedOutput,
            receivedOutput: request.body.receivedOutput,
            userAgent: request.body.userAgent,
            userDate: request.body.userDate,
            source: request.query.source || 'direct'
        })

        /* se for crítico */
        if (request.body.issueType === 'CRITICAL') {
            sgMail.setApiKey(sendGridKey)
            const msg = {
                to: 'devmobillo@gmail.com',
                from: 'devmobillo@gmail.com',
                subject: 'BUG Crítico Reportado',
                text: `O usuário ${request.body.name} reportou um problema.`,
                html: `<strong>O usuário ${request.body.name} reportou um problema</strong>`,
            }
            await sgMail.send(msg);
        }

        response.render('sucesso')

    } catch (err) {
        response.send('Erro ao enviar formulário.')
        console.log(err)

    }


    /*response.send(request.body)*/
    /*const doc = new GoogleSpreadsheet(docId)
    doc.useServiceAccountAuth(credentials, (err) => {
        if (err) {
            console.log('nao foi possivel abrir a planilha')
        } else {
            console.log('planilha aberta')
            doc.getInfo((err, info) => {
                const worksheet = info.worksheets[worksheetIndex]
                worksheet.addRow({ name: request.body.name, email: request.body.email, issueType: request.body.issueType, howToReproduce: request.body.howToReproduce, expectedOutput: request.body.expectedOutput, receivedOutput: request.body.receivedOutput }, err => {
                    response.send('Bug reportado com sucesso!')
                    console.log('linha inserida')
                })
            })
        }
    })*/
})

app.listen(3000, (err) => {
    if (err) {
        console.log('Aconteceu um erro', err)
    } else {
        console.log('BugTracker rodando... na porta http://localhost:3000')
    }
})