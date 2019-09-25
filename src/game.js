const Deck = require('./deck');

class Game {
    constructor(players, playersId) {
        const deck1 = new Deck();
        this.game = {
            active: true,
            players: [{
                nome: players[0],
                id: playersId[0],
                team: 'red',
                cartas: [deck1.deal(),
                deck1.deal(),
                deck1.deal()]
            },
            {
                nome: players[1],
                id: playersId[1],
                team: 'red',
                cartas: [deck1.deal(),
                deck1.deal(),
                deck1.deal()]
            },
            {
                nome: players[2],
                id: playersId[2],
                team: 'blue',
                cartas: [deck1.deal(),
                deck1.deal(),
                deck1.deal()]
            }, {
                nome: players[3],
                id: playersId[3],
                team: 'blue',
                cartas: [deck1.deal(),
                deck1.deal(),
                deck1.deal()]
            }],
            table: {
                teamsPoint: {
                    red: 5,
                    blue: 3
                },
                coringa: deck1.deal(),
                turno: {
                    player: 'dsadas432' // mudar se pah
                },
                valueTruco: 3,
                requestTruco: {
                    requested: true,
                    by: 'redTeam',
                    value: 6
                },
                centroMesa: []
            }
        }
    }
    getInfos(socketid) {
        //pegar o id e enviar somenta as cartas dele e a quantidade de carta de cada jogador e informaçoes publicas da partida
        var removeCards = this.game;
        for (var i = 0; i < 4; i++) {
            if (this.game.players[i].id == socketid) {

            } else {
                removeCards = { ...removeCards, ...this.game.players[i].cards.splice(3, 1) };
            }
        }
        console.log(removeCards)
        const infoGame = {
            players
        }
    }
};
module.exports = Game;