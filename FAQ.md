# Frequently Asked Questions

[[_TOC_]]

### General Questions

#### Q: Why aren't the descriptions of things from the book, graphics from the book, etc shown in the compendiums instead of page numbers?
The simple answer is copyright concerns.  There has been some explorations of licensing including communications with Pinnacle entertainment that have resulted in the current policy.  The current module is released under Pinnacles very generous fan license but does not cover copyright materials.  This issue is further complicated by the fact that FoundryVTT has it's own licencing model and this SWADE system rolls up under that, not to mention the system is open source which makes keeping copyrighted content secure extremely difficult.
  
#### Q: My XYX SWADE Compendium is blank or broken!
Stop your server, delete the offending compendium(s) and restart the server.  It will autoload any missing compendiums from the system.

#### Q: I think I found a bug, how do I report it:?

Make sure you have a clear description of the bug and know the FoundryVTT and SWADE system versions where the bug is happening.  Include that information in your report.
- You can open an issue on this gitlab project site.
- You can report it on the system-development channel.

#### Q: I don't see feature XYZ, how do I let you know I want it?

- Ask on the foundry vtt discord channel #other-game-systems with SWADE clearly mentioned.
- Open an issue on this gitlab project site. (better to ask first probably)
- Be willing to accept an answer of no, or not for a while.  This system is being developed for free by developers who have lives, jobs, etc - be respectful of their time and effort.
- Consider contributing the feature if you have the skills.

### Developer questions

#### Q: How do I contribute to the latest development?
- Fork the repo into your own space and check out the develop branch locally to work on.  Submission of content must come as merge request on the develop branch and is subject to approval and review before acceptance.

#### Q: I can't build the project - I'm getting type errors or ???
- The project has dependencies on the https://gitlab.com/foundry-projects/foundry-pc/foundry-pc-types
- When developers need the latest types used in the SWADE system sometimes the master:head is out of sync with what the swade developer(S) are using from that dependency.  The solution is to find the latest type development by looking at the outstanding merge requests for that project and using that instead. **For example:**
    - `npm uninstall --save-dev gitlab:foundry-projects/foundry-pc/foundry-pc-types`
    - `npm install --save-dev gitlab:florad92/foundry-pc-types`

