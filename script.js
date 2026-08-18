class Player {
    static id = 0;
    constructor(cash, name) {
        this.id = Player.id
        this.name = name;
        this.cash = cash;
        this.account = 0;
        this.debt = [0,0,0,0];
        this.tookloan = false;
        Player.id++;
    }

    increment() {
        console.log(`Incrementing`)
        this.account = Math.round(this.account * 1.1);

        if(this.debt[3] !== 0) {
            console.log(`Player ${this.id} defaulted on debt worth ${this.debt[3]}.`)
            //return 0;
        }

        for(let i = this.debt.length - 1; i > 0; i--) {
            this.debt[i] = Math.round(this.debt[i-1] * 1.1);
        }
        this.debt[0] = 0;
        this.tookloan = false;
        return 1;
    }

    takeLoan(amount) {
        if(!this.tookloan) {
            this.debt[0] = amount;
            this.tookloan = true;
        } else {
            console.log(`Cannot take a loan.`)
        }
    }

    transferIn(amount) {
        if (this.cash >= amount) {
            this.account += amount;
            this.cash -= amount;
        }
    }

    transferOut(amount) {
        if(this.account >= amount) {
            this.account -= amount;
            this.cash += amount;
        }
    }
}

const players = []

function addPlayer() {
    if(players.filter(Boolean).length >= 5) {
        console.log("Max players reached")
        return;
    }
    let name = document.getElementById('name').value;
    if(!name) {
        console.log(`No name entered.`)
        return;
    }
    const player = new Player(400000, name);
    players[player.id] = player;
    console.log(`Created player ${player.id}`)

    createPlayerDiv(player);
}

function createPlayerDiv(player) {
    const div = document.createElement('div');

    //Top level
    const top = document.createElement("div")
    const name = document.createTextNode(" " + player.name + " ");
    const account = document.createTextNode("account value: " + player.account.toString() + " ");
    top.appendChild(name);
    top.appendChild(account);

    //Bottom level loans (declared early so handlers can refresh them)
    const loandiv = document.createElement('div');
    const debts = []
    const loans = []
    for(let i = 0; i < player.debt.length; i++) {
        const btn = document.createElement('input')
        btn.type = 'radio'
        btn.name = `group-${player.id}`
        btn.value = i;
        loans.push(btn);
        debts[i] = document.createTextNode(`Loan ${i}: ` + player.debt[i].toString() + " ")
        const br = document.createElement('br');
        loandiv.appendChild(br);
        loandiv.appendChild(debts[i]);
        loandiv.appendChild(loans[i]);
    }

    function refreshDebts() {
        for(let i = 0; i < player.debt.length; i++) {
            debts[i].textContent = `Loan ${i}: ` + player.debt[i].toString() + " ";
        }
    }
    function refreshAccount() {
        account.textContent = "account value: " + player.account.toString() + " ";
    }

    //Medium level
    const mid = document.createElement('div')
    const investinput = document.createElement('input')
    investinput.placeholder = '0';
    const invest = document.createElement('button')
    invest.textContent = 'Invest!'
    invest.addEventListener('click', () => {
        const amount = Number(investinput.value);
        if(!player.increment()) {          // defaulted
        //    div.remove();
        //    delete players[player.id];
        //    return;                        // stop: player is gone
        }
        player.transferIn(amount);
        refreshAccount();
        refreshDebts();                    // loans shifted this turn
    })
    const sell = document.createElement('button')
    sell.textContent = 'Sell :('
    sell.addEventListener('click', () => {
        const amount = Number(investinput.value);
        player.transferOut(amount);
        refreshAccount();
    })

    mid.appendChild(investinput);
    mid.appendChild(invest);
    mid.appendChild(sell)

    //Bottom level buttons and inputs
    const bottom = document.createElement("div");
    const loaninput = document.createElement('input');
    loaninput.placeholder = '0';
    const loan = document.createElement('button');
    loan.textContent = 'Loan';
    loan.addEventListener('click', () => {
        const amount = Number(loaninput.value);
        player.takeLoan(amount);           // may refuse internally
        refreshDebts();                    // reflect actual state
    })
    const repay = document.createElement('button');
    repay.textContent = 'Repay';
    repay.addEventListener('click', () => {
        const amount = Number(loaninput.value)
        const sel = document.querySelector(`input[name="group-${player.id}"]:checked`);
        if (!sel) {                        // nothing selected
            console.log("No loan selected.");
            return;
        }
        const index = Number(sel.value);
        player.debt[index] -= amount;            // clear the chosen slot
        refreshDebts();
    })

    bottom.appendChild(loaninput);
    bottom.appendChild(loan);
    bottom.appendChild(repay);
    bottom.appendChild(loandiv);

    //Remove
    const rem = document.createElement('div');
    const remove = document.createElement('button')
    remove.textContent = 'Suicide'
    remove.addEventListener('click', () => {
        div.remove();
        delete players[player.id];
    })
    rem.appendChild(remove);

    //Assemble
    div.appendChild(top);
    div.appendChild(mid);
    div.appendChild(bottom);
    div.appendChild(rem);
    div.appendChild(document.createElement('hr'));
    const current = document.getElementById("mainpage")
    document.body.insertBefore(div, current);
}