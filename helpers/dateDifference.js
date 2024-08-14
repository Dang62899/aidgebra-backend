const computeDate = (oldDate, newDate) => {
    const a = new Date(oldDate)
    const b = new Date(newDate)

    if((a == "Invalid Date") || (b == "Invalid Date")) return ({status : false, error : "Invalid Date"})

    let difference = b - a

    return ({status : true, data : difference})
}

module.exports = computeDate