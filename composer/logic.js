/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.bp.Setup} setup - the Setup transaction
 * @transaction
 */
function setup(setup){
    var factory = getFactory();
    var NS = 'org.bp';

    //create a sample donor
    var donor = factory.newResource(NS, 'Donor', '3141')
    donor.patientData = '{"name":"John Doe", "medical_status":"Not so healthy"}'
    //create a sample recepient 
    var recepient = factory.newResource(NS, 'Recepient', '1618')
    recepient.patientData = '{"name":"Jane Doe", "medical_status":"Kind of healthy"}'
    return getParticipantRegistry(NS + 'Donor')
        .then(function (donorRegistry){
            return donorRegistry.addAll([donor])
        })
        .then(function(recepientRegistory){
            return recepientRegistory.addAll([recepient])
        })
}


//Write give
function Give(donator){
    var NS = 'org.bp';
    var organ = factory
        .newResource(NS, 
                    'organ', 
                    give.organID)
    organ.data = donator.data
    organ.status = "INPOOL"
    return getAssetRegistry(NS + '.Organ')
        .then(function (organRegistry) {
            // add the donor
            return organRegistry.addAll([organ]);
        });

}
//Write receive
function Receive(receiver){
    var NS = 'org.bp';
    var organ = receiver.organ
    organ.status = "matched"
    return getAssetRegistry(NS + '.Organ')
    .then(function (organRegistry) {
        return organRegistry.update(organ);
    });

}