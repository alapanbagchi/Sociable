import { Message } from "discord.js"

const ROLE_MENTION = /<?@?&?(\d{17,20})>?/;
const MEMBER_MENTION = /<?@?!?(\d{17,20})>?/;
const CHANNEL_MENTION = /<?#?(\d{17,20})>?/;


//Return the member object of the member mention or ID
const resolveMember = async (message: Message, query: string, exact: boolean = false) => {
    const memberManager = message.guild?.members

    //Check if the user is mentioned or if an ID is passed
    const patternMatch = query.match(MEMBER_MENTION)
    if (patternMatch) {
        const id = patternMatch[1]
        const mentioned = message.mentions.members?.find(m => m.id === id)
        if (mentioned) return mentioned
        const fetched = await memberManager?.fetch({ user: id }).catch(() => { })
        if (fetched) return fetched
    }

    //Fetch the members from API
    await memberManager?.fetch({ query }).catch(() => { })

    //Check if the exact tag is matched
    const matchingTags = memberManager?.cache.filter(m => m.user.tag === query)
    if (matchingTags?.size === 1) return matchingTags.first()

    if (!exact) {
        return memberManager?.cache.find((x) => x.user.username === query || x.user.username.toLowerCase().includes(query.toLowerCase()) || x.displayName.toLowerCase().includes(query.toLowerCase()))
    }
}

export {
    resolveMember
}