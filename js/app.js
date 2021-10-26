(function() {    
    let initialState = true;
    const api = bitcoinAPI();
    const utils = formatUtils();

    window.addEventListener('load', () => {
        const def = utils.formatInputDate(new Date());
        console.log(def);
        document.getElementById('dateInput').value = def;
        console.log(document.getElementById('dateInput').value);
      });
 
    document.addEventListener('submit', ( event ) => {
        event.preventDefault();
        handleSubmit(event.target[0].value);
    });

    const addDateWithBTCValue = ( date, btcValue ) => {
        const existentRow = document.getElementsByClassName('grid__block__table__row')[0];
        const tr = existentRow.cloneNode(true);
        tr.children[0].textContent = date;
        tr.children[2].textContent = utils.formatEuroCurrency(btcValue);

        existentRow.parentNode.insertBefore(tr, existentRow);
        if( initialState ) {
            tr.classList.remove('grid__block__table__row--blank');
            document.getElementsByClassName('grid__block__table__row grid__block__table__row--blank')[0].remove();
            initialState = false;
        }
    };

    const showNoInformationWarning = () => {
        const warning = 'There is no information for this date.';
        const messageNodes = document.getElementsByClassName('grid__block__warning');
        if( messageNodes.length === 0 ) {
            const div = document.getElementsByClassName('grid__block--datetime-entry')[0];
            const msg = document.createElement('div');
            msg.classList.add('grid__block__warning');
            msg.textContent = warning
            div.append(msg);
        }
        else {
            messageNodes[0].textContent = warning;
        }
    };

    const cleanWarnings = () => {
        const messageNodes = document.getElementsByClassName('grid__block__warning');
        if( messageNodes.length !== 0 ) {
            messageNodes[0].remove();
        }
    };

    const handleSubmit = ( inDate ) => {
        const b = document.getElementById('submitButton');
        b.setAttribute('disabled','');
        cleanWarnings();

        let nextLottoDraw = getNextLottoDraw(inDate);
        if( !nextLottoDraw ) {
            showNoInformationWarning();
            b.removeAttribute('disabled');
            return
        }
        nextLottoDraw = utils.formatStringDate(nextLottoDraw);

        Promise.all([
            api.getCurrentPrice(),
            api.getHistoricalPrice(nextLottoDraw.slice(0, 10))
        ]).then( results => {
            const todayPrice = results[0].market_data.current_price.eur;
            const historicPrice = results[1].market_data.current_price.eur;
            addDateWithBTCValue( nextLottoDraw, ( todayPrice / historicPrice ) * 100 );
            b.removeAttribute('disabled');
        }).catch( msg => {
            console.log(msg);
            showNoInformationWarning();
            b.removeAttribute('disabled');
        });
    };
})();

/**
* Determines the next Lotto draw for a given date.
* @param {Date} inDate
*/
function getNextLottoDraw( inDate ) {
    const selectedDate = ( inDate ) ? new Date(inDate) : new Date();
    const maxDate = new Date();

    if( selectedDate >= maxDate ) {
        return false;
    }
    
    const firstLottoDay = ( 3 * 24 + 20 ) * 60; // Wed 20hs of every week, in minutes
    const secondLottoDay = ( 6 * 24 + 20 ) * 60; // Sat 20hs of every week, in minutes
    const selectedWeekDay = ( selectedDate.getDay() * 24 + selectedDate.getHours() ) * 60 + selectedDate.getMinutes(); // Input in minutes
    const nextLottoDraw = new Date(selectedDate);

    nextLottoDraw.setHours(20,0,0,0);
    if( selectedWeekDay < firstLottoDay ) {
        // Before Wed 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + 3 - selectedDate.getDay() );
    } else if( selectedWeekDay >= secondLottoDay ) {
        // After Sat 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + ( 7 - selectedDate.getDay() ) + 3 );
    } else {
        // Between Wed 20hs and Sat 20hs
        nextLottoDraw.setDate( nextLottoDraw.getDate() + 6 - selectedDate.getDay() );
    }

    if( nextLottoDraw > maxDate ) {
        return false;
    }

    return nextLottoDraw;
}

function bitcoinAPI() {
    const baseURL = 'https://api.coingecko.com/api/v3/coins/bitcoin';
    const historicalPriceURL = param => `${baseURL}/history?date=${param}`;
    const currentPriceURL = () => baseURL;

    const getHistoricalPrice = param => 
        new Promise( (resolve, reject) => {
            fetch( historicalPriceURL(param) ).then( response => {
                resolve( response.json() );
            }).catch( error => reject( error ) )
        });

    const getCurrentPrice = () => 
        new Promise( (resolve, reject) => {
            fetch( currentPriceURL() ).then( response => {
                resolve( response.json() );
            }).catch( error => reject( error ) )
        });

    return({
        getHistoricalPrice,
        getCurrentPrice
    });
}

function formatUtils() {
    const euroF = new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const formatEuroCurrency = (numValue) => euroF.format(numValue);

    const formatStringDate = (date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const time = date.toLocaleTimeString('en-IE').slice(0,5);
        return `${(d <= 9) ? '0' + d : d}-${(m <= 9) ? '0' + m : m}-${y} ${time}`
    };

    const formatInputDate = (date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const time = date.toLocaleTimeString('en-IE').slice(0,5);
        return `${y}-${(m <= 9) ? '0' + m : m}-${(d <= 9) ? '0' + d : d}T${time}`
    }

    return {
        formatStringDate,
        formatEuroCurrency,
        formatInputDate
    };
}