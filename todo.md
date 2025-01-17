# todo 

- fully rework web editor
  - currently is pretty bad and was made in like. an hour with some barebones ass code from chatgpt
  - so when remade ill actually do all the coding myself

- add capability to filter with regex to add-playlist and add-search
  - won't be too hard as then i just have to add an optional argument

- add optional DJ role (if specified, only that role can use commands)

- partial code rewrites
  - rewrite 2
    - make more util functions (or maybe just more classes) to handle more things
    - for example, paging. paging is currently mostly done by the command itself, only having some functions generate pages for it.
    - ~~paging may be done easier if it's mapped internally instead of within just the command.~~

- rewrite the commands that use pages, so the PageHolder class is ACTUALLY used
  - currently ~~bot.ts~~ the command handles the paging instead of just.. using the functions

- rewrite search command
  - it currently tries to exclude instead of exclusively searching for something
  - and i cant search for all types from what i know

- add support for more package managers
  - for the list part it only supports npm due to formatting
  - you know what maybe i should just check the node_modules folder or package.json lmao
 
- i may work on an addon that uses cobalt's api (locally hosted so no ratelimit) to play songs
   - this means it'll pretty much automatically have support for everything cobalt has support for
   - which is.. a lot
   - ![image](https://github.com/tairasoul/YADMB/assets/100938045/78dc450c-f0ae-4af4-b750-c4e780935729)


# finished + comments

- ability to force cache invalidation
  - this way playlists can be forcefully re-cached if you have a playlist you made modifications to on youtube
  - no clue how to tell the cache where it's being called and if it should invalidate the get request for that function, so ill just pass it into the resolvers that have cache passed in.
  - while this does mean invalidation is up to the resolver, it shouldn't be too hard for resolvers to implement
 
- ability to use an in-memory database instead
  - if you don't want persistent caching, this will work best
  - will probably be default
  - turns out you could already do this by setting cache_path to :memory:

- maybe make it possible for end-users to view the cache if they wanna see what gets cached?
  - probably a good idea for transparency in what gets cached
  - uses underlying connection to serialize into buffer and send
  
- for cache, maybe expose methods within cache that allows you to get a unique identifier for a specific track?
  - okay nevermind im dumb you can literally get search params by just doing new URL(url) lol

- instead of paging at command execute time, ~~page when a song is added and add some embeds for each song if playlist~~ cache info about a song
  - ~~this means live-updating view-queue will be easier~~ it's just a snapshot now so
  - it wont take as much time to do view-queue
  - may use an sql database
  - cache will be formatted like
    - service name
      - song identifier
        - data (thumbnail, name, etc.)
  - resolvers implement checking and getting/saving cache
  - config.json can be used to configure invalidation or disable it
  - if the cache for the song is invalidated, itll go through the same resolving process as normal
  - all addons share the same cache

- update web-ui to work with latest addon update

- resolver priority + more effective way of checking if it can be used on a url
  - resolvers now expose an available() function that returns true or false. if true, it can be used.
  - they also expose a priority variable, which means that:
    - if it is higher, it will be tried earlier.
    - if it is lower, it will be tried later.

- rework addon system
  - an addon no longer has a type, and instead has a "data" property, containing resolvers and commands.

- add a "both" option to shuffle
  - shuffles every playlist and the queue

- packages system
  - packages.json declares npm modules your addon needs
  - bot installs them
  - bot uninstalls npm modules if no addons use them
  - if you need a specific version, include it in the addon and add the version's dependencies as dependencies in packages.json!

- change up audio addons a bit
  - instead of making it so you're limited by fields already provided
  - make it so each addon can declare their own fields
  - so if a platform has specific metrics, you can add those in as fields

- online playlist editor/viewer
  - just an idea.
  - runs off the same addons as the default bot (mostly the resolvers)
  - allows you to create, view and edit custom playlists online
  - bot host can choose to run it alongside the bot
  - up to them to forward it though

- update utils.ts
  - what to update:
    - pager functions
    - they all assume that the track is a youtube track.
    - this means that it will error sometimes if it isn't a youtube track
  - potential solution:
    - pager addons.
    - they expose 2 resolvers.
    - one for a track in a playlist, one for a queued item. (aka replacing utils.trackPager and utils.queuedTrackPager)

- addons
  - i had an idea very suddenly and it seems interesting so im working on it
  - basically, a way to create custom addons, ~~alongside patching some of my own methods~~ and adding commands.
  - this may be difficult as i have NO clue how to do it but fuck it we ball
  - idk how useful this'll be but fuck it
  - the idea is to make it so you don't have to depend on me or a fork of my bot to add support for a platform
  - instead, if you have coding experience you can just make an addon and add it in

- partial code rewrites
  - rewrite 1
    - instead of having A LOT of things handled in bot.ts, move some things over to seperate classes
    - for example, make a Client class extension that has all the queue shit internally.
    - also have an internal command collection, and an easy way to seperate all the commands into seperate files instead of needing to have them all in the same file.
    - this will make it so bot.ts isn't as bloated as it is right now, and will make it easier to expand later on
    - another thing it will have is custom crucial events (ex. a custom InteractionCreate event that passes the guild's info to it aswell)
    - this will make it so each command can do whatever it needs to do with the queue, without actually accessing anything outside of the arguments given by the event.

- add a edit-playlist command
  - just added it cause i thought it'd be pretty dumb to have create-playlist and no way to edit a playlist

- switch to a seperate QueueHandler class
  - makes it a LOT cleaner than whatever bs i had before

- add a progress command
  - does not update live
  - shows how long is remaining
  - shows the thumbnail (if possible, i'm having issues with showing thumbnail in add-search)
  - shows song name, author, likes, views

- add a server-info command
  - gives info about the server as seen within the music bot, so queued tracks, volume, all that
  - getting opinions on how it looks atm, will be finished later

- find and fix some final bugs with the current queue system
    - the new queue system has a few bugs left due to the fact it's now more of just adding mini-queues and not singular links
    - it should be completely functional now

- command to view current queue
  - made different pager functions
  - page handling is done in bot.ts

- fix the issue where it sometimes just stops the current song and plays the next one
  - need to add support for soundcloud and spotify next

- make it so you can skip a whole playlist or just a single song
  - reworked music system but it introduced a few bugs, those will be fixed

- migrate from local filesystem to directly streaming from youtube 
  - i am not sure if it still gets rate-limited, we'll have to fuck around and find out to see

- add a command to search for channels/playlists (alternate version of add-search)
  - play-dl does this

- ~~no longer uses ytdl, instead uses youtube-dlsr~~ wasn't good either, now play-dl

- auto-leave after 5 minutes of being alone in a vc or when alone in vc
  - this was originally implemented as "leave when alone in vc" but oceanic.js doesn't make the old vc status contain the channel the user was in
  - solved by storing the old channel upon joining within the guild data
  
- shuffle command
  - randomly shuffles each song in the list

- hopefully increase the speed of add-playlist
  - no longer tells you every song added, was very unnecessary

- rewrite
  - done rewriting
  - old code had parts from 7 months ago and i wanted to change up the queue system a lil bit

# cancelled + reason

- change libraries from ytdl to use [youtube-stream-url](https://www.npmjs.com/package/youtube-stream-url)
  - the resulting url doesn't work
