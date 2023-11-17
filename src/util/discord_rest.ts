import { APIGuild, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
config();

class DiscorRestCalls {

    rest: REST;
    
    constructor(rest: REST) {
        this.rest = rest;
    }

}

module.exports = {
    
}