/**
* Determines the next Lotto draw for a given date between April 16, 1988 and today.
* @param {Date} inDate
*/
function getNextLottoDraw(inDate) {
    inDate = (inDate) ? new Date(inDate) : new Date();
    let minDate = new Date('April 16, 1988 20:00:00'); // Irish Lotto begins
    let maxDate = new Date();
    //const toIETimezone = date => date.toLocaleString("en-US", {timeZone: 'Europe/Dublin'});

    if( inDate < minDate || inDate >= maxDate ) {
        return false;
    }
    
    let firstLottoDay = ( 3 * 24 + 20 ) * 60; // Wed 20hs of every week, in minutes
    let secondLottoDay = ( 6 * 24 + 20 ) * 60; // Sat 20hs of every week, in minutes
    let currentWeekDay = ( inDate.getDay() * 24 + inDate.getHours() ) * 60 + inDate.getMinutes(); // Input in minutes
    let nextLottoDraw = new Date(inDate);

    nextLottoDraw.setHours(20,0,0,0);
    if( currentWeekDay < firstLottoDay ) {
        // Before Wed 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + 3 - inDate.getDay() );
    } else if( currentWeekDay >= secondLottoDay ) {
        // After Sat 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + ( 7 - inDate.getDay() ) + 3 );
    } else {
        // Between Wed 20hs and Sat 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + 6 - inDate.getDay() );
    }

    if( nextLottoDraw > maxDate ) {
        return false;
    }

    return nextLottoDraw;
}

(function() {
    const dateBTCList = [];

    const submitHandler = (inDate) => {

        //disable button

        let nextLottoDraw = getNextLottoDraw(inDate);
        
        if( !nextLottoDraw ) {
            // Inform in the view
            // 'There is no information for the selected date.'
        }

        //HTTP req to get BTC value
        //add date,value pair to list
        //render in the DOM

        //enable button
    };

    // Register events    
    document.addEventListener('submit', (event) => {
        event.preventDefault();
        submitHandler(event.target[0].value);
    });
})();