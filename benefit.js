const person= require('./person')

class Benefit extends person{
constructor(pension_amount, pension_frequency, pension_type_id, appointee){
    super(uid, username, password);
    this.isadmin = isadmin
}
// GETTERS

get getPensionAmount() {
    return this.pension_amount
}

get getPensionFrequency() {
    return this.pension_frequency
}

get getPensionTypeID() {
    return this.pension_type_id
}

get getAppointee() {
    return this.appointee
}

    // SETTERS

    set setPensionAmount(pension_amount) {
        this.pension_amount = pension_amount;
    }

    set setPensionFrequency(pension_frequency) {
        this.pension_frequency = pension_frequency;
    }

    set setPensionTypeID(pension_type_id) {
        this.pension_type_id = pension_type_id;
    }

    set setAppointee(appointee) {
        this.appointee = appointee;
    }
};

module.exports = Benefit