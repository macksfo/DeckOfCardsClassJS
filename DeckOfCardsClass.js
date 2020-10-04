class DeckofCards {
    
    /*
    DeckOfCards will handle constructing a playing deck, shuffling, reshuffling, burning cards and returning (dealing) cards
    that a client application can then present anyway that it likes.
    */
    
    
    // get a random number
    // NOTE BENE!!! A lot of work has been done to demonstrate how many pseudo random number generators can be predicted 
    // given the approximate time of generation and knowledge of a few picks, i.e. cards.  If you use this clas for any
    // serious card playing game, you need to research that and replace this standard JS random number generator with 
    // a randomize function that can't be hacked.  That's why random has been pulled out into this separate function so
    // it can be easily replaced.  YOU HAVE BEEN WARNED!!
    randomMethod() {
        return(Math.random());
    }

    // validate parameters using a defaultValue, the correct range, and the parameter
    valParam(defaultValue, range, parameter) {
        
        if (parameter == undefined) return defaultValue;
        
        if (typeof defaultValue == "string") {
            if (range.includes(parameter)) {
                return parameter;
            } else {
                return defaultValue;
            }
        }
        
        if  (typeof defaultValue == "number") {
            if (typeof parameter === "number") {
                parameter = (Math.round(parameter));
            }
            else {
                if (typeof parameter === "string") {
                    parameter = parseInt(parameter, 10);
                    if (isNaN(parameter)) {
                        parameter = defaultValue;
                    }
                    else {
                        parameter = Math.round(parameter);
                    }
                }
                else {
                    parameter = defaultValue;
                }
            }
            if (parameter < range[0] || parameter > range[1]) parameter = defaultValue; 
            return parameter;
        }
        
    } // end of valParam

    
    constructor(deckType, numJokers, numDecks) {
        /* Construct the deck of cards requested.
           deckType can be "standard" (52 cards), "jass"(36 cards 6 to Ace), "skat"(32 cards 7 to Ace) 
           or "euchre" (24 cards 9 to Ace).  A pinochle deck can be built by using type "euchre" and setting
           numDecks to 2.  If deckType is invalid, it is set to "standard".
           numJokers; the number of jokers added to the deck must be a number from 0 to 10.  If omitted, not
           interpretable, negative, or greater than 10, it is set to 0.  If non-integer, it's rounded.
           numDecks; the number of decks created must be a number from 1 to 10.  If omitted, not interpretable, less
           than 1, or greater than 10, it is set to 1.  If non-integer, it's rounded.
        */
        

        // Validate the class parameters - numJokers, then numDecks,then deckType
        let jokerRange = [0, 10];
        numJokers = this.valParam(0, jokerRange, numJokers);
        
        let decksRange = [1, 10];
        numDecks = this.valParam(1, decksRange, numDecks);

        let lowCardIndex = -1;
        let typeRange = ["standard", "jass", "skat", "euchre"];
        deckType = this.valParam("standard", typeRange, deckType);
        if (deckType == "jass") {
            lowCardIndex = 4;
        }
        else {
            if (deckType == "skat") {
                lowCardIndex = 5;
            }
            else {
                if (deckType == "euchre") {
                    lowCardIndex = 7;
                }
                else {
                    // standard deckType
                    lowCardIndex = 0;
                }
            }
        }

        // Calculate the deck size and create the deck array

        let highCardIndex = 12;
        this.deckSize = (((highCardIndex - lowCardIndex + 1) * 4) + numJokers) * numDecks;
        
        // let's initialize the suits
        let suit = ["D", "C", "H", "S"];
        // let's initialize the card values
        let value = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
        // create an array for unshuffled card names and a shuffled deck pointers

        this.deck = [];
        this.shuffledPtrs = new Array(this.deckSize);
        for (let counter = 0; counter < this.deckSize; counter++) {
            this.shuffledPtrs[counter] = counter;
        }

        // let's initialize our card names in an unshuffled deck
        for (let suitCounter = 0; suitCounter < 4; suitCounter++) {
            for (let valueCounter = lowCardIndex; valueCounter <= highCardIndex; valueCounter++) {
                this.deck.push(value[valueCounter] + suit[suitCounter]);
            }
        }
        // Add the jokers, if any
        for (let jokerCounter = 0; jokerCounter < numJokers; jokerCounter++) {
            this.deck.push("J");
        }
        // Multiply the decks, if required
        if (numDecks > 1) {
            let singleDeck = this.deck;
            for (let decksCounter = 1; decksCounter < numDecks; decksCounter++) {
                this.deck.push(singleDeck);
            }
        }
        
        // set some object values we're going to need
        this.currentCard = 0;
        this.cardsRemaining = this.deckSize;
        
        
    // End of constructor
    }
    
    // return an array of numCards to the caller representing the next numCards in the deck
    deal(numCards) {
        if (isNaN(numCards)) {
            return null;
        } else {
            if (numCards < 1 || this.cardsRemaining == 0) {
                return null;
            } else {
                if (numCards > this.cardsRemaining) {
                    numCards = this.cardsRemaining;
                }
                let returnedCards = new Array(numCards);
                for (let counter = 0; counter < numCards; counter++) {
                    returnedCards[counter] = this.deck[this.shuffledPtrs[this.currentCard]];
                    this.currentCard++;
                    this.cardsRemaining--;
                }
                return(returnedCards);
                }
            }
    } // end of method deal
 
    // discard the next numcards in the deck by incrmeenting currentCard   
    burn(numCards) {
       if (isNaN(numCards)) {
            return null;
        } else {
            if (numCards < 1 || this.cardsRemaining == 0) {
                return null;
            } else {
                if (numCards > this.cardsRemaining) {
                    numCards = this.cardsRemaining;
                }
                this.currentCard = this.currentCard + numCards;
                this.cardsRemaining = this.cardsRemaining - numCards;
                return(numCards);
                }
            }
        
    } // end of burn

    // shuffle a deck initialized to be in suit and rank order (times number of decks)    
    shuffle() {
        // reinitialize deck to unshuffled
        for (let counter = 0; counter < this.deckSize; counter++) {
            this.shuffledPtrs[counter] = counter;
        }
        this.currentCard = 0;
        this.cardsRemaining = this.deckSize;
        
        // initialize some working variables
        var place = 0;
        var saveplace = 0;

        // Now we're going to randomly swap cards to the bottom of the deck until we reach the top
        for (let counter = this.deckSize - 1; counter > 0; counter--) {

            place = this.randomMethod() * (counter + 1);
            place = Math.floor(place);
            saveplace = this.shuffledPtrs[counter];
            this.shuffledPtrs[counter] = this.shuffledPtrs[place];
            this.shuffledPtrs[place] = saveplace;

            }

    } // end of shuffle

    // reshuffle wil only shuffle the remaining cards as oppoosed to the entire deck    
    reshuffle() {
        
        // initialize some working variables
        var place = 0;
        var saveplace = 0;

        // Now we're going to randomly swap cards to the bottom of the deck until we reach the top
        for (let counter = this.deckSize - 1; counter > this.currentCard; counter--) {

            place = this.randomMethod() * (counter + 1 - this.currentCard);
            place = Math.floor(place) + this.currentCard;
            saveplace = this.shuffledPtrs[counter];
            this.shuffledPtrs[counter] = this.shuffledPtrs[place];
            this.shuffledPtrs[place] = saveplace;

            }
        
    } // end of reshuffle
        
        

} // end of Class DeckofCards

module.exports = DeckofCards;
