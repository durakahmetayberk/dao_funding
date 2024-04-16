// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Dao is ERC20 {
    IERC20 public token;
    //name of the dao token
    string _name;
    // symbol of the dao token
    string _symbol;
    // variable that holds the number of addresses holds 1 or more dao token
    uint256 memberNumber;
    // mapping of proposals , key: proposal id, value : proposal
    mapping(uint => Proposal) proposals;
    // mapping of surveys , key: survey id, value : survey
    mapping(uint => Survey) surveys;
    // mapping that holds the boolesn values if an adress already used the fauset
    mapping(address => bool) isFauced;
    //mapping for all projects that holds mapping of voter detials
    mapping(uint => mapping(address=> Voter)) voters;
    // a maping that holds if the addresses has voted or delegated, the lock time which resstricts
    // the reduction of balance under 1 until proposal deadline
    mapping(address  => uint) locks;
    // id of next proposal and it is incremented when a new proposal is submitted
    uint proposalId = 0 ;
    // id of next survey and it is incremented when a new survey is submitted
    uint surveyId = 0;
    // variable that holds the total reserved balance for funded projects
    uint reservedUsdBalance = 0;
    // variable that holds the total number of funded proposals, it is incremented 1 when a project gets funded
    uint fundedProposals =0;

    // constractor takes the address of stableCoin, and supply of the dao token then creates an instance of usd token to use it
    constructor(uint256 _tokensupply, address _usdAddress)
        ERC20(_name, _symbol)
    {
        token = IERC20(_usdAddress);
        _mint(address(this), _tokensupply);
    }
    // voter is a struct that holds the properties of voters
    struct Voter{
        // property that counts deleagted votes
        uint weight;
        // property that if voter has voted, note that there are different voter objects for each address for each project
        bool proposalVoted;
        // property holds if vote has delegated
        address delegate;
        // similar to proposalVoted, it holds if payment has voted
        bool paymentVoted;
    }
    // proposal is a struct that holds the properties of proposals
    struct Proposal {
        // ipfs hash that holds the hash of proposal info, which can be checked via this hash
        string ipfsHash_;
        // deadline of the proposal 
        uint proposalVoteDeadline_;
        uint[] paymentAmounts_;
        uint[] paymentSchedule_; 
        address proposalOwner_;
        // vote counter for proposal
        uint proposalVoteNumber_;
        // votecounter for payment
        uint paymentVoteNumber_;
        // boolean that holds if project is funded
        bool isfunded_;
        // variable that holds in which stage the payment is
        uint paymentStage_;
        // the payments has done to this project
        uint paidAmount_;
        // remaining (initial - paidAmount_)usd tokens reserved to this project
        uint reservedAmount_;
        // boolean that holds if the funding has lost in the past if it is true, project cannot be funded again
        bool fundingLost_;
    }
    // survey is a struct that holds the properties of surveys
    struct Survey {
        // ipfs hash that holds the hash of survey info, which can be checked via this hash
        string ipfsHash_;
        uint surveyDeadline_;
        // number of questions in the survey
        uint numChoices_;
        // the number of  options each question have
        uint atmostChoice_;
        // owner addres of survey
        address surveyOwner_;
        // results array of the array, each index corresponds to the option indexes and the values in
        // it is how many times  they selected
        uint[] results_;
        // the number of how many times this survey is taken
        uint surveyTaken_;
    }

    // this function trasfers the specified amount of usd token from the sender to contract address
    function donateUSD(uint256 amount) public {
        require(token.transferFrom(msg.sender, address(this), amount));
        
    }
    // _update function is overriden in order to check some conditions and track some changes
    function _update(address from, address to, uint256 value) internal override  virtual {

                // check if the from address is able to reduce its mygov balance under 1 if its balance becomes lower than 1.
                // we check it because if a member votes for a proposal or delegates its vote  the member is no longer albe to reduce
                //its balance under 1.
                if (balanceOf(msg.sender) >= 1*10^18 && balanceOf(msg.sender) - value < 1*10^18) {
                    require(locks[msg.sender] > block.timestamp,"you are not alloved to reduce your balance under 1 since you have voted or delegated your vote");
                }


                //every transaction that causes balance change calls this function, I have modified it in a way
                // that it check if the sender loses membership and if the reciever gains memebership and it
                // counts the membernNumber this way.
                //membership: every addres that holds 1 or more dao token is called member.
                if (balanceOf(from)>1*10^18 && balanceOf(from)- value <1*10^18) {
                    memberNumber -=1;
                }
                if (balanceOf(to)<1*10^18 && balanceOf(to) + value >1*10^18) {
                    memberNumber += 1;
                }
                return super._update( from,  to,  value);

    }
    // donation is done by specified mygov token from sender to reciever
    function donateMyGovToken(uint256 amount) public {
        _transfer(msg.sender, address(this), amount);
    }
    // this is vote fundciton, the specified proposal with its id is voted positive or negative, function cheks if the msg.sender is 
    // eligible for voting via checking if it is member and if it has not voted yet for this project proposal.
    function voteForProjectProposal(uint256 projectid, bool choice) public {
        Voter storage sender = voters[projectid][msg.sender];
        //check if sender is member
        require(balanceOf(msg.sender) >= 1*10^18, "You are not member!");
        // check if sender has already voted or delegated its votes for this project
        require(!sender.proposalVoted, "Already voted.");
        sender.proposalVoted = true;
        if(choice == true) {
            proposals[projectid].proposalVoteNumber_ += sender.weight +1;
        }
    }
    // this is vote function for project payment , votes for specified project with its id
    function voteForProjectPayment(uint256 projectid, bool choice) public {
        Voter storage sender = voters[projectid][msg.sender];
        // check is sender is member
        require(balanceOf(msg.sender) >= 1*10^18, "You are not member!");
        // check if sender is already voted or delegated its vote for this project
        require(!sender.paymentVoted, "Already voted.");
        sender.paymentVoted = true;
        if(choice == true) {
            // +1 is own vote of the sender, and weight is delegated votes to sender;
            proposals[projectid].paymentVoteNumber_ += sender.weight +1;
        }
    }
    // the function that trasfer votting right to another member
    function delegateVoteTo(address memberaddr,uint projectid) public{
        // check if reciever is member
        require(balanceOf(msg.sender) >= 1*10^18);
        require(balanceOf(memberaddr) >= 1*10^18);
        // check if sender has voted or delegated this project
        require(!(voters[projectid][msg.sender].proposalVoted || voters[projectid][msg.sender].paymentVoted),"you have voted already");
        require(voters[projectid][msg.sender].delegate == address(0),"you have already delegated");
        require(memberaddr != msg.sender, "Self-delegation is disallowed.");
        while (voters[projectid][memberaddr].delegate != address(0)) {
            memberaddr = voters[projectid][memberaddr].delegate;
            // We found a loop in the delegation, not allowed.
            require(memberaddr != msg.sender, "Found loop in delegation.");
        }
        voters[projectid][msg.sender].proposalVoted = true;
        voters[projectid][msg.sender].delegate = memberaddr;
        Voter storage delegate_ = voters[projectid][memberaddr];
        if (delegate_.proposalVoted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[projectid].proposalVoteNumber_ += voters[projectid][msg.sender].weight +1;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += voters[projectid][msg.sender].weight +1;
        }


    }
    // this function takes ipfshash(hash  of details of project that can be checked trough ipfs later), votedeadline, 
    // payment amounts and schedchule then it submits the project
    function submitProjectProposal(
        string memory ipfshash,
        uint256 votedeadline,
        uint256[] memory paymentamounts,
        uint256[] memory payschedule
    ) public returns (uint256 projectid) {
        // the function cost is 50 usd token and 5 dao token
        require(transferFrom(msg.sender, address(this), 50*10^18));
        _transfer(msg.sender, address(this), 5*10^58);
        // new proposal created with uniqe id and its props is filled
        Proposal storage newProposal = proposals[proposalId];
        newProposal.ipfsHash_ = ipfshash;
        newProposal.proposalVoteDeadline_ = votedeadline;
        newProposal.paymentAmounts_ = paymentamounts;
        newProposal.paymentSchedule_ = payschedule;
        newProposal.proposalOwner_ = msg.sender;
        newProposal.proposalVoteNumber_ = 0;
        newProposal.isfunded_ = false;
        proposals[proposalId] = newProposal;
        proposalId += 1;
        // retuns the id of submitted project which is 1 less then the nex project id holder
        return proposalId -1;
    }
    // the functions takes ipfshash, surveydeadline, numchoices, atmostchoice parameters then, submits the survey with its unique id
    function submitSurvey(
        string memory ipfshash,
        uint256 surveydeadline,
        uint256 numchoices,
        uint256 atmostchoice
    ) public returns (uint256 surveyid) {
        // submitting cost (5 usd token, and 2 dao token) is collected from the sender
        require(transferFrom(msg.sender, address(this), 5*10^18));
        _transfer(msg.sender, address(this), 2*10^18);
        // new survey has created and its props has filled
        Survey storage newSurvey = surveys[surveyid];
        newSurvey.ipfsHash_ = ipfshash;
        newSurvey.surveyDeadline_ = surveydeadline;
        newSurvey.numChoices_ = numchoices;
        newSurvey.atmostChoice_ = atmostchoice;
        newSurvey.surveyOwner_ = msg.sender;
        newSurvey.surveyTaken_ = 0;
        surveyId +=1;
        return surveyId -1;
    }
    
    // index of choices is the id of the choice and the value of it is how many times it is selected.
    // take survey function writes the chocices into results array of that survey, and increments the value of selected choices 
    function takeSurvey(uint256 surveyid, uint256[] memory choices) public {
        for (uint i = 0; i<choices.length ; i++) 
        {
            surveys[surveyid].results_[choices[i]]+=1;
        }
    }
    // the function reserves the project grand if it can be done, the function can be called just by the owner of the project.
    function reserveProjectGrant(uint256 projectid) public {
        // if the project has lost its funding once, its grant cannot be reserved again. It chekc if this happened
        require(proposals[projectid].fundingLost_ == false,"the project lost its chance");
        // checks if proposal has already funded
        require(!proposals[projectid].isfunded_,"project have already been funded");
        // checks if the caller is the owner of the project
        require(msg.sender == proposals[projectid].proposalOwner_,"Only project proposer can reserve the grant!");
        // chekcs if the project deadline has passed
        require(proposals[projectid].proposalVoteDeadline_ >= block.timestamp,"Proposal deadline has past!");
        // checks if the project got  the 1/10 th of the votes of memebers
        require(proposals[projectid].proposalVoteNumber_*10>=memberNumber,"1/10 requirement hasnt met");
        // calculate the project funding amount
        uint projectAmount =0 ;
        for (uint i = 0; i < proposals[projectid].paymentAmounts_.length ; i++) 
        {
            projectAmount += proposals[projectid].paymentAmounts_[i];
        }
        // check if dao has enough balance to fund the project
        require(token.balanceOf(address(this))-reservedUsdBalance>= projectAmount);
        // if all the requirements are met then, project is funded and information about it is rerecorded
        // reserved balance is updated.
        proposals[projectid].isfunded_ = true;
        proposals[projectid].reservedAmount_ = projectAmount;
        reservedUsdBalance += projectAmount;
        proposals[projectid].paymentStage_ = 0;
        fundedProposals += 1 ;
        
    }
        // this function withraws the function payment, only the owner of the project can call it.
    function withdrawProjectPayment(uint256 projectid) public {
        Proposal storage theProject = proposals[projectid];
        // check if the sender is owner of this project
        require(msg.sender == theProject.proposalOwner_,"Only project proposer can reserve the grant!");
        // check if the project is funded
        require(theProject.isfunded_, "project is not funded");
        // if payment vote is under 1/100 th of the member numbers then project losts its funding
        // reservred usd balance has decreased with the number of unpayed reserved project balance.
        if (theProject.paymentVoteNumber_*100 < memberNumber){
            theProject.isfunded_ = false;
            reservedUsdBalance -=theProject.reservedAmount_;
            theProject.reservedAmount_=0;
            theProject.paymentStage_=0;
            theProject.fundingLost_=true;
        }
        // check if the project lost its funding within if block above.
        require(theProject.isfunded_, "project lost its funding due to the 1/100 payment requirement");
        // check if the payment time has come
        require(theProject.paymentSchedule_[theProject.paymentStage_] <= block.timestamp,"payment time did not come");
        // if everything is okey send project payment to the project owner. and update the related values.
        token.transferFrom(address(this), msg.sender, theProject.paymentAmounts_[theProject.paymentStage_]);
        reservedUsdBalance -= theProject.paymentAmounts_[theProject.paymentStage_];
        theProject.reservedAmount_ -= theProject.paymentAmounts_[theProject.paymentStage_];
        theProject.paidAmount_ += theProject.paymentAmounts_[theProject.paymentStage_];
        theProject.paymentStage_ += 1;
    }
        // returns the ruslts of the survey given its id
    function getSurveyResults(uint256 surveyid)
        public
        view
        returns (uint256 numtaken, uint256[] memory results)
    {
        return(surveys[surveyid].surveyTaken_, surveys[surveyid].results_);
        }
        // returns the survey info
    function getSurveyInfo(uint256 surveyid)
        public
        view
        returns (
            string memory ipfshash,
            uint256 surveydeadline,
            uint256 numchoices,
            uint256 atmostchoice
        )
    {
        Survey memory ourSurvey = surveys[surveyid];
        return (ourSurvey.ipfsHash_, ourSurvey.surveyDeadline_, ourSurvey.numChoices_, ourSurvey. atmostChoice_);
    }
    
    // retunrs the owner address of the given survey
    function getSurveyOwner(uint256 surveyid)
        public
        view
        returns (address surveyowner)
    {
        return surveys[surveyid].surveyOwner_;
    }

    // returns if the project has funded
    function getIsProjectFunded(uint256 projectid)
        public
        view
        returns (bool funded)
    {
        return proposals[projectid].isfunded_;
    }

    // returns the next payment amount of the given project
    function getProjectNextPayment(uint256 projectid)
        public
        view
        returns (int256 next)
    {
        return int(proposals[projectid].paymentAmounts_[proposals[projectid].paymentStage_]);
    }

    // returns the owner of the given project
    function getProjectOwner(uint256 projectid)
        public
        view
        returns (address projectowner)
    {
        return proposals[projectid].proposalOwner_;
    }

    // returns the project info of the given project
    function getProjectInfo(uint256 activityid)
        public
        view
        returns (
            string memory ipfshash,
            uint256 votedeadline,
            uint256[] memory paymentamounts,
            uint256[] memory payschedule
        )
    {
        Proposal storage project = proposals[activityid];
        return (project.ipfsHash_, project.proposalVoteDeadline_, project.paymentAmounts_, project.paymentSchedule_);
    }

    // returns the number of the project proposal which is hold within proposalId variable.
    function getNoOfProjectProposals()
        public
        view
        returns (uint256 numproposals)
    {
        return proposalId;
    }

    // returns the number of projcts funded which is hold in the fundedProposals variable
    function getNoOfFundedProjects() public view returns (uint256 numfunded) {
        return fundedProposals;
    }
    // returns the amount of usd a project has recieved that holded in the paidAmount propoerty of  proposal
    function getUSDReceivedByProject(uint256 projectid)
        public
        view
        returns (uint256 amount)
    {
        return proposals[projectid].paidAmount_;
    }
    // returns the number of the survey which is holded in the surveyId variable
    function getNoOfSurveys() public view returns (uint256 numsurveys) {
        return surveyId;
    }
    // this function gives 1 dao token to the caller if sender did not call it earlier and dao has enough tokens to give
    function faucet() public {
        //checks if the sender get its token free token earlier
        require(!isFauced[msg.sender], "You have already claimed MyGov");
        // checks if the dao has enough tokens to send
        require(balanceOf(address(this)) >= 1*10^18, "no tokens left!");
        _transfer(address(this), msg.sender, 1*10^18);
        isFauced[msg.sender] = true;
    }
}
