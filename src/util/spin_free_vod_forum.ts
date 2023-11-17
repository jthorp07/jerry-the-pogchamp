import { Collection, ChannelType, ForumChannel, AnyThreadChannel, Guild, APIThreadChannel } from 'discord.js';
import { Client as TwitchClient } from 'tmi.js';
import { stdTempData, ptrTempData, addSpinData } from '../data/standard_submissions';

const VOD_REVIEW_FORUM = {
    key: 'vodforum',
    channelId: '1148751451506622527'
}
const TIER_3_REVIEW_FORUM = {
    key: 'tierthree',
    channelId: '1150160654485954590'
}

function test(data: APIThreadChannel) {


    /*

        StartWith: {forumId}

        GET channels/:channel_id/threads/archived/private
        GET channels/:channel_id/threads/archived/public
    */
    data.id;
}

const fetchThreadsFromForum = async (channel: ForumChannel): Promise<AnyThreadChannel<boolean>[]> => {
    
    
    const activeThreads = await channel.threads.fetch();
    const archivedThreads = await channel.threads.fetch({archived: {
        fetchAll: true,
    }});

    
    let activeThreadsCache = activeThreads.threads;
    let archivedThreadsCache = archivedThreads.threads;
        
    let threadBuf = [];
    activeThreadsCache.forEach(thread => {
        threadBuf.push(thread);
    });
    archivedThreadsCache.forEach(thread => {
        threadBuf.push(thread);
    });
    return threadBuf;
}

const freeVodReviewSpin = async (guild: Guild) => {
    /** @type {ForumChannel} */
    const channel = await guild.channels.fetch(VOD_REVIEW_FORUM.channelId);
    if (!channel || !channel.type === ChannelType.GuildForum) return;
    /**@type {AnyThreadChannel<boolean>[]} */
    let allThreads;
    const allThreadsPromise = fetchThreadsFromForum(channel).then(_allThreads => allThreads = _allThreads);

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    stdTempData.reset();
    let numEntries = 0;
    let numPosts = 0;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        console.log('Discord: Forum channel missing tags');
        return;
    }

    let buf = [];
    await allThreadsPromise;

    console.log(`There are ${allThreads.length} threads`);
    const currentDate = new Date(Date.now());
    for (const thread of allThreads) {

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            let owner;
            let ownerThreadMember = thread.fetchOwner().then(member => {
                owner = member?.guildMember;
            });
            let starterMessage;
            let starterMessageFetch = thread.fetchStarterMessage().then(message => {
                starterMessage = message;
            }).catch(err => {
                starterMessage = null;
            });
            await ownerThreadMember;
            if (!owner) {
                console.log("No owner");
                continue;
            }
            let entries = 1;
            const patreonStatusMultiplier = owner.roles.cache.has("1094354496609591296") ? 4 : owner.roles.cache.has("1094354494218834040") ? 3 : owner.roles.cache.has("1094354485297561730") ? 2 : 1;
            const postAgeMultiplier = await (async () => {
                
                const postDate = thread.createdAt;
                if (!postDate) return 1;

                const differenceInMillis = currentDate.getTime() - postDate.getTime();
                const wholeWeeks = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24 * 7));
                const mult = 1 + Math.floor(wholeWeeks / 2);
                return mult;
            }).call();
            

            entries *= patreonStatusMultiplier * postAgeMultiplier;
            await starterMessageFetch;
            if (!starterMessage) {
                console.log("No message fetch");
                continue;
            }
            stdTempData.addPostAge(currentDate.getTime() - thread.createdAt.getTime());
            numEntries += entries;
            numPosts++;
            for (let j = 0; j < entries; j++) {
                buf.push({
                    ownerId: owner.id,
                    ownerDisplayName: owner.displayName,
                    ownerUsername: owner.user.username,
                    clip: starterMessage
                });
            }
        }
    }

    addSpinData(numPosts, numEntries, 'std_vod');

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness

    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let coachChannel = await interaction.guild.channels.fetch("1161809001923747971");
    const winningContent = `Raffle Winner Message:\n\n${winningMessage.content}`;
    if (!coachChannel || !coachChannel.isTextBased()) {


    } else {
        coachChannel.send({ content: winningContent.length >= 2000 ? winningMessage.content : winningContent });
    }
    

}

/**
 * 
 * @param {Guild} guild
 */
const tierThreeVodSpin = async (guild) => {


    /** @type {ForumChannel} */
    const channel = await guild.channels.fetch(TIER_3_REVIEW_FORUM.channelId);
    if (!channel || !channel.type === ChannelType.GuildForum) return;
    /**@type {AnyThreadChannel<boolean>[]} */
    let allThreads;
    const allThreadsPromise = fetchThreadsFromForum(channel).then(_allThreads => allThreads = _allThreads);

    let approvedTagId;
    let deniedTagId;
    let reviewedTagId;

    ptrTempData.reset();
    let numEntries = 0;
    let numPosts = 0;

    channel.availableTags.forEach(tag => {
        if (tag.name.toLowerCase() == "approved") approvedTagId = tag.id;
        if (tag.name.toLowerCase() == "denied") deniedTagId = tag.id;
        if (tag.name.toLowerCase() == "reviewed") reviewedTagId = tag.id;
    });

    if (!approvedTagId || !reviewedTagId || !deniedTagId) {
        await interaction.editReply({content:"This forum is missing one or multiple of the required tags:\n  \"approved\"\n  \"denied\"\n  \"reviewed\""});
        return;
    }

    let buf = [];
    const currentDate = new Date(Date.now());
    await allThreadsPromise;
    for (const thread of allThreads) {

        if (thread.appliedTags.includes(approvedTagId) && !thread.appliedTags.includes(reviewedTagId)) {
            let owner = (await thread.fetchOwner())?.guildMember;
            if (!owner) continue;

            let starterMessage = await thread.fetchStarterMessage();
            if (!starterMessage) continue;

            let entries = 1;
            const postAgeMultiplier = await (async () => {
                
                const postDate = thread.createdAt;
                if (!postDate) return 1;

                const differenceInMillis = currentDate.getTime() - postDate.getTime();
                const wholeWeeks = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24 * 7));
                const mult = 1 + Math.floor(wholeWeeks / 2);

                return mult;
            }).call();

            entries *= postAgeMultiplier;

            ptrTempData.addPostAge(currentDate.getTime() - thread.createdAt.getTime());
            numEntries += entries;
            numPosts++;

            buf.push({
                ownerId: owner.id,
                ownerDisplayName: owner.displayName,
                ownerUsername: owner.user.username,
                clip: starterMessage
            });

        }
    }

    addSpinData(numPosts, numEntries, 'ptr_vod');

    if (buf.length == 0) {
        await interaction.editReply({content:'There are no tier three patreon submissions!'});
        return;
    }

    // __testWinRateDistributionForBuffer(buf); // Simulates 10,000 roles and logs win rates to determine fairness
    let winner = Math.floor(Math.random() * buf.length); // To test, move this logic into the commented function above
    let winningMessage = buf[winner].clip;
    let newContent = `The winner is: <@${buf[winner].ownerId}>`;

    let coachChannel = await guild.channels.fetch("1161809001923747971");
    if (!coachChannel || !coachChannel.isTextBased()) {

    } else {
        coachChannel.send({ content: `Raffle Winner Message:\n\n${winningMessage.content}` })
    }
    await interaction.editReply({ content: newContent });
}

const sourceMap = new Collection();
sourceMap.set(VOD_REVIEW_FORUM.key, freeVodReviewSpin);
sourceMap.set(TIER_3_REVIEW_FORUM.key, tierThreeVodSpin);

module.exports = {
    /**
     * @param {Guild} guild 
     * @param {TwitchClient} bot 
     * @param {string} type
     */
    async execute(guild, bot, type) {

        let spinFunc = sourceMap.get(type);
        await spinFunc(bot, guild);
    },
    types: {
        standard: VOD_REVIEW_FORUM.key,
        patreon: TIER_3_REVIEW_FORUM.key,
    }
}

function __testWinRateDistributionForBuffer(buf) {
    let winnerRates = new Collection();
    for (let i = 0; i < 10000; i++) {
        let winner = Math.floor(Math.random() * buf.length);
        if (winner === buf.length) winner -= 1;

        if (winnerRates.get(winner) == undefined) {
            winnerRates.set(winner, 1);
        } else {
            winnerRates.set(winner, winnerRates.get(winner) + 1);
        }
    }

    console.log("For buffer length " + buf.length);
    console.log(JSON.stringify(winnerRates));
}
