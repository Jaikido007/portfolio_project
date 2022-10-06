class Person {

    constructor(nino, title, first_name, last_name, dob, address1, address2, address3, town, county, postcode) {
        this.nino = nino;
        this.title = title;
        this.first_name = first_name;
        this.last_name = last_name;
        this.dob = dob;
        this.address1 = address1;
        this.address2 = address2;
        this.address3 = address3;
        this.town = town;
        this.county = county;
        this.postcode = postcode;
    }

    // GETTERS

    get getNino() {
        return this.nino
    }

    get getTitle() {
        return this.title
    }

    get getFirstName() {
        return this.first_name
    }

    get getLastName() {
        return this.last_name
    }

    get getDOB() {
        return this.dob
    }

    get getAddress1() {
        return this.address1
    }

    get getAddress2() {
        return this.address2
    }

    get getAddress3() {
        return this.address3
    }

    get getTown() {
        return this.town
    }

    get getCounty() {
        return this.county
    }

    get getPostcode() {
        return this.postcode
    }

    // SETTERS

    set setNino(nino) {
        this.nino = nino;
    }

    set setTitle(title) {
        this.title = title;
    }

    set setFirstName(first_name) {
        this.first_name = first_name;
    }

    set setLastName(last_name) {
        this.last_name = last_name;
    }

    set setDOB(dob) {
        this.dob = dob;
    }

    set setAddress1(address1) {
        this.address1 = address1;
    }

    set setAddress2(address2) {
        this.address2 = address2;
    }

    set setAddress3(address3) {
        this.address3 = address3;
    }

    set setTown(town) {
        this.town = town;
    }

    set setCounty(county) {
        this.county = county;
    }

    set setPostcode(postcode) {
        this.postcode = postcode;
    }
};

module.exports = Person;