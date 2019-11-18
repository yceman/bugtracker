const GoogleSpreadsheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')

const doc = new GoogleSpreadsheet('1zMlrQnxNR_AopxzLE3iUZYLuUtmKdkojGSAB44s6IDY')
doc.useServiceAccountAuth(credentials, (err) => {
    if (err) {
        console.log('nao foi possivel abrir a planilha')
    } else {
        console.log('planilha aberta')
        doc.getInfo((err, info) => {
            const worksheet = info.worksheets[0]
            worksheet.addRow({ name: 'Marcos', email: 'test' }, err => {
                console.log('linha inserida')
            })
        })
    }
})