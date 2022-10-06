const person= require('./person')

class Benefit extends person{
constructor(nino, title, first_name, last_name, dob, address1, address2, address3, town, 
            county, postcode, pension_amount, pension_frequency, pension_type, appointee,
            sc_q1, sc_q2, sc_a1, sc_a2, bank_name, bank_acc_no, bank_sort_code){
    super(nino, title, first_name, last_name, dob, address1, address2, address3, town, county, postcode);
    this.pension_amount = pension_amount;
    this.pension_frequency = pension_frequency
    this.pension_type = pension_type;
    this.appointee = appointee
    this.sc_q1 = sc_q1
    this.sc_q2 = sc_q2
    this.sc_a1 = sc_a1
    this.sc_a2 = sc_a2
    this.bank_name = bank_name
    this.bank_acc_no = bank_acc_no
    this.bank_sort_code = bank_sort_code
}
// GETTERS

get getPensionAmount() {
    return this.pension_amount
}

get getPensionFrequency() {
    return this.pension_frequency
}

get getPensionType() {
    return this.pension_type
}

get getAppointee() {
    return this.appointee
}

get getSecurityQuestion1() {
    return this.sc_q1
}

get getSecurityQuestion2() {
    return this.sc_q2
}

get getSecurityAnswer1() {
    return this.sc_a1
}

get getSecurityAnswer2() {
    return this.sc_a2
}

get getBankName() {
    return this.bank_name
}

get getBankAccountNumber() {
    return this.bank_acc_no
}

get getBankSortCode() {
    return this.bank_sort_code
}
    // SETTERS

    set setPensionAmount(pension_amount) {
        this.pension_amount = pension_amount;
    }

    set setPensionFrequency(pension_frequency) {
        this.pension_frequency = pension_frequency;
    }

    set setPensionType(pension_type) {
        this.pension_type = pension_type;
    }

    set setAppointee(appointee) {
        this.appointee = appointee;
    }

    set setSecurityQuestion1(sc_q1) {
        this.sc_q1 = sc_q1;
    }

    set setSecurityQuestion2(sc_q2) {
        this.sc_q2 = sc_q2;
    }

    set setSecurityAnswer1(sc_a1) {
        this.sc_a1 = sc_a1;
    }

    set setSecurityAnswer2(sc_a2) {
        this.sc_a2 = sc_a2;
    }

    set setBankName(bank_name) {
        this.bank_name = bank_name;
    }

    set setBankAccountNumber(bank_acc_no) {
        this.bank_acc_no = bank_acc_no;
    }

    set setBankSortCode(bank_sort_code) {
        this.bank_sort_code = bank_sort_code;
    }
};

module.exports = Benefit