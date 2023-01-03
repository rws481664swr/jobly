
module.exports= function generateFilterSQL({minEmployees, maxEmployees, name}) {
    let vals=[]
    let i=1
    let str= 'WHERE'
    if (name){
        str+=` name ILIKE $${i++}`
        vals.push(`%${name}%`)
    }
    if (minEmployees && maxEmployees){
        str+= `${i===1?'':' AND'} num_employees BETWEEN $${i++} AND $${i++}`
        vals.push(minEmployees)
        vals.push(maxEmployees)

    }else  if(minEmployees){
        str+= `${i===1?'':' AND'} num_employees >= $${i++} `

        vals.push(minEmployees)

    }else if(maxEmployees){
        str+= `${i===1?'':' AND'} num_employees <= $${i++} `
        vals.push(maxEmployees)

    }
    if (!vals.length) return null;
    return[str.trim(),vals,minEmployees||maxEmployees]
}
