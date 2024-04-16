import React, { useState } from "react";
import a from "./ERC20abi.json";
import { ethers, parseEther } from "ethers";
import { BrowserProvider, parseUnits } from "ethers";

const ContractInteraction = () => {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with your contract's address
  const contractAbi = a;
  const [amount, setAmount] = useState(0);
  const [ipfsHash, setIpfsHash] = useState("");
  const [voteDeadline, setVoteDeadline] = useState(0);
  const [paymentAmounts, setPaymentAmounts] = useState([]);
  const [paymentSchedule, setPaymentSchedule] = useState([]);

  const [surveyId, setSurveyId] = useState("");
  const [projectID, setProjectID] = useState("");
  const [surveyResults, setSurveyResults] = useState(null);
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [surveyOwner, setSurveyOwner] = useState("");
  const [isProjectFunded, setIsProjectFunded] = useState(false);
  const [projectNextPayment, setProjectNextPayment] = useState("");
  const [projectOwner, setProjectOwner] = useState("");
  const [projectInfo, setProjectInfo] = useState(null);

  const [donateAmount, setDonateAmount] = useState("");
  const [voteForProposal, setVoteForProposal] = useState(false);
  const [voteForPayment, setVoteForPayment] = useState(false);
  const [delegateAddress, setDelegateAddress] = useState("");

  const [ipfsHashProposal, setIpfsHashProposal] = useState("");
  const [votedeadline, setVotedeadline] = useState(0);

  const [ipfsHashSurvey, setIpfsHashSurvey] = useState("");
  const [surveyDeadline, setSurveyDeadline] = useState(0);
  const [numChoices, setNumChoices] = useState(0);
  const [atmostChoice, setAtmostChoice] = useState(0);

  const [choices, setChoices] = useState([]);

  const [projectIDGrant, setProjectIDGrant] = useState(0);
  const [projectIDPayment, setProjectIDPayment] = useState(0);
  const [surveyResultsLoading, setSurveyResultsLoading] = useState(false);

  // Initialize ethers
  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractAbi, signer);
  };
  const handleSubmitProjectProposal = async (e) => {
    try {
      const contract = await getContract();
      await contract.submitProjectProposal(
        ipfsHashProposal,
        votedeadline,
        paymentAmounts.map(Number),
        paymentSchedule.map(Number)
      );

      console.log("Project Proposal Submitted Successfully");
    } catch (error) {
      console.error("Error in submitting project proposal:", error);
    }
  };

  // Handler for submitSurvey
  const handleSubmitSurvey = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.submitSurvey(
        "ipfsHashSurvey",
        31313131313,
        2,
        3
      );
      await tx.wait();
      console.log("Survey Submitted Successfully");
    } catch (error) {
      console.error("Error in submitting survey:", error);
    }
  };

  // Handler for takeSurvey
  const handleTakeSurvey = async () => {
    try {
      const contract = await getContract();
      const choicesArray = choices.split(",").map(Number); // Assuming choices are entered as comma-separated values
      const tx = await contract.takeSurvey(surveyId, choicesArray);
      await tx.wait();
      console.log("Survey Taken Successfully");
    } catch (error) {
      console.error("Error in taking survey:", error);
    }
  };

  // Handler for reserveProjectGrant
  const handleReserveProjectGrant = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.reserveProjectGrant(projectIDGrant);
      await tx.wait();
      console.log("Project Grant Reserved Successfully");
    } catch (error) {
      console.error("Error in reserving project grant:", error);
    }
  };

  // Handler for withdrawProjectPayment
  const handleWithdrawProjectPayment = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.withdrawProjectPayment(projectIDPayment);
      await tx.wait();
      console.log("Project Payment Withdrawn Successfully");
    } catch (error) {
      console.error("Error in withdrawing project payment:", error);
    }
  };

  const handleDonateMyGovToken = async () => {
    try {
      const contract = await getContract();
      const amount = parseEther(donateAmount);
      const tx = await contract.donateMyGovToken(amount);
      await tx.wait();
      console.log("Donation successful");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handler for voteForProjectProposal
  const handleVoteForProjectProposal = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.voteForProjectProposal(
        projectID,
        voteForProposal
      );
      await tx.wait();
      console.log("Voted for project proposal successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handler for voteForProjectPayment
  const handleVoteForProjectPayment = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.voteForProjectPayment(
        projectID,
        voteForPayment
      );
      await tx.wait();
      console.log("Voted for project payment successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handler for delegateVoteTo
  const handleDelegateVoteTo = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.delegateVoteTo(delegateAddress, projectID);
      await tx.wait();
      console.log("Delegated vote successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to get survey results
  const handleGetSurveyResults = async () => {
    try {
      setSurveyResultsLoading(true);
      const contract = await getContract();
      const results = await contract.getSurveyResults(surveyId);
      setSurveyResults(results);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSurveyResultsLoading(false);
    }
  };

  // Function to get survey info
  const handleGetSurveyInfo = async () => {
    const contract = await getContract();
    const info = await contract.getSurveyInfo(surveyId);
    setSurveyInfo(info);
  };

  // Function to get survey owner
  const handleGetSurveyOwner = async () => {
    const contract = await getContract();
    const owner = await contract.getSurveyOwner(surveyId);
    setSurveyOwner(owner);
  };

  // Function to check if a project is funded
  const handleGetIsProjectFunded = async () => {
    const contract = await getContract();
    const funded = await contract.getIsProjectFunded(projectID);
    setIsProjectFunded(funded);
  };

  // Function to get the next payment amount for a project
  const handleGetProjectNextPayment = async () => {
    const contract = await getContract();
    const nextPayment = await contract.getProjectNextPayment(projectID);
    setProjectNextPayment(nextPayment.toString());
  };

  // Function to get the project owner
  const handleGetProjectOwner = async () => {
    const contract = await getContract();
    const owner = await contract.getProjectOwner(projectID);
    setProjectOwner(owner);
  };

  // Function to get project info
  const handleGetProjectInfo = async () => {
    const contract = await getContract();
    const info = await contract.getProjectInfo(projectID);
    setProjectInfo(info);
  };

  const handleDonateUSD = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.donateUSD(parseEther(amount));
      await tx.wait();
      console.log("Donation successful");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFaucet = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.faucet();
      await tx.wait();
      console.log("Faucet successful");
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleGetNoOfFundedProjects = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.getNoOfFundedProjects();
      console.log(tx);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleGetUSDReceivedByProject = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.getUSDReceivedByProject();
      console.log(" successful", tx);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleGetNoOfSurveys = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.getNoOfSurveys();
      console.log(" successful", tx);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleGetNoOfProjectProposals = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.getNoOfProjectProposals();
      console.log(" successful", tx);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-black">
      <h2 className="text-2xl font-semibold text-gray-400 text-center mb-8">
        Smart Contract Interaction
      </h2>

      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Submit Project Proposal
        </h3>
        <form onSubmit={handleSubmitProjectProposal}>
          <div className="my-3">
            <label className="block text-gray-400">IPFS Hash:</label>
            <input
              type="text"
              value={ipfsHashProposal}
              onChange={(e) => setIpfsHashProposal(e.target.value)}
              className="input input-bordered w-full focus:ring focus:outline-none"
              placeholder="IPFS Hash"
            />
          </div>
          <div className="my-3">
            <label className="block text-gray-400">Vote Deadline:</label>
            <input
              type="number"
              value={votedeadline}
              onChange={(e) => setVotedeadline(Number(e.target.value))}
              className="input input-bordered w-full focus:ring focus:outline-none"
              placeholder="Vote Deadline"
            />
          </div>
          <div className="my-3">
            <label className="block text-gray-400">Payment Amounts:</label>
            <input
              type="text"
              value={paymentAmounts}
              onChange={(e) =>
                setPaymentAmounts(Number(e.target.value.split(",")))
              }
              className="input input-bordered w-full focus:ring focus:outline-none"
              placeholder="Payment Amounts (comma-separated)"
            />
          </div>
          <div className="my-3">
            <label className="block text-gray-400">Payment Schedule:</label>
            <input
              type="text"
              value={paymentSchedule}
              onChange={(e) =>
                setPaymentSchedule(Number(e.target.value.split(",")))
              }
              className="input input-bordered w-full focus:ring focus:outline-none"
              placeholder="Payment Schedule (comma-separated)"
            />
          </div>
          <footer className="p-4">
            <button
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Submit Proposal
            </button>
          </footer>
        </form>
      </div>

      {/* UI for Submit Survey */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Submit Survey
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">IPFS Hash:</label>
          <input
            type="text"
            value={ipfsHashSurvey}
            onChange={(e) => setIpfsHashSurvey(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="IPFS Hash"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">Survey Deadline:</label>
          <input
            type="number"
            value={surveyDeadline}
            onChange={(e) => setSurveyDeadline(Number(e.target.value))}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Survey Deadline"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">Number of Choices:</label>
          <input
            type="number"
            value={numChoices}
            onChange={(e) => setNumChoices(Number(e.target.value))}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Number of Choices"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">At Most Choice:</label>
          <input
            type="number"
            value={atmostChoice}
            onChange={(e) => setAtmostChoice(Number(e.target.value))}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="At Most Choice"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleSubmitSurvey}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Submit Survey
          </button>
        </footer>
      </div>

      {/* UI for Take Survey */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Take Survey
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Survey ID:</label>
          <input
            type="number"
            value={surveyId}
            onChange={(e) => setSurveyId(Number(e.target.value))}
            className="input input-bordered w-fullfocus:ring focus:outline-none"
            placeholder="Survey ID"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">
            Choices (comma-separated):
          </label>
          <input
            type="text"
            value={choices}
            onChange={(e) => setChoices(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Choices"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleTakeSurvey}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Take Survey
          </button>
        </footer>
      </div>
      {/* UI for Reserve Project Grant */}

      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Reserve Project Grant
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Project ID:</label>
          <input
            type="number"
            value={projectIDGrant}
            onChange={(e) => setProjectIDGrant(Number(e.target.value))}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Project ID"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleReserveProjectGrant}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Reserve Grant
          </button>
        </footer>
      </div>
      {/* UI for Withdraw Project Payment */}

      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Withdraw Project Payment
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Project ID:</label>
          <input
            type="text"
            value={projectID}
            onChange={(e) => setProjectID(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Project ID"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleWithdrawProjectPayment}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Withdraw Payment
          </button>
        </footer>
      </div>

      {/* UI for donateMyGovToken */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Donate MyGov Token
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Amount to Donate:</label>
          <input
            type="text"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Amount to Donate"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleDonateMyGovToken}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Donate
          </button>
        </footer>
      </div>

      {/* UI for voteForProjectProposal */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Vote for Project Proposal
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Project ID:</label>
          <input
            type="number"
            value={projectID}
            onChange={(e) => setProjectID(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Enter Project ID"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">Vote Choice:</label>
          <select
            value={voteForProposal}
            onChange={(e) => setVoteForProposal(e.target.value === "true")}
            className="input input-bordered w-full focus:ring focus:outline-none"
          >
            <option value="true">Approve</option>
            <option value="false">Reject</option>
          </select>
        </div>
        <footer className="p-4">
          <button
            onClick={handleVoteForProjectProposal}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Submit Vote
          </button>
        </footer>
      </div>

      {/* UI for voteForProjectPayment */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Vote for Project Payment
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Project ID:</label>
          <input
            type="text"
            value={projectID}
            onChange={(e) => setProjectID(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Project ID"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">Vote Choice:</label>
          <select
            value={voteForPayment}
            onChange={(e) => setVoteForPayment(e.target.value === "true")}
            className="input input-bordered w-full focus:ring focus:outline-none"
          >
            <option value="true">Approve</option>
            <option value="false">Reject</option>
          </select>
        </div>
        <footer className="p-4">
          <button
            onClick={handleVoteForProjectPayment}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Vote
          </button>
        </footer>
      </div>

      {/* UI for delegateVoteTo */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Delegate Vote
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Delegate To Address:</label>
          <input
            type="text"
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Delegate To Address"
          />
        </div>
        <div className="my-3">
          <label className="block text-gray-400">Project ID:</label>
          <input
            type="text"
            value={projectID}
            onChange={(e) => setProjectID(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Project ID"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleDelegateVoteTo}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Delegate
          </button>
        </footer>
      </div>
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Survey Results
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Survey ID:</label>
          <input
            type="number"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Survey ID"
            disabled={surveyResultsLoading}
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleGetSurveyResults}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            disabled={surveyResultsLoading}
          >
            {surveyResultsLoading ? "Loading..." : "Get Results"}
          </button>
        </footer>
        {surveyResults && (
          <p className="text-gray-400 mt-4">
            Results: {JSON.stringify(surveyResults)}
          </p>
        )}
      </div>

      {/* UI for Get Survey Info */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Survey Info
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetSurveyInfo}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get Info
          </button>
        </footer>
        {surveyInfo && (
          <p className="text-gray-400 mt-4">
            Info: {JSON.stringify(surveyInfo)}
          </p>
        )}
      </div>

      {/* UI for Get Survey Owner */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Survey Owner
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetSurveyOwner}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get Owner
          </button>
        </footer>
        {surveyOwner && (
          <p className="text-gray-400 mt-4">Owner: {surveyOwner}</p>
        )}
      </div>

      {/* UI for Get Is Project Funded */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Is Project Funded?
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetIsProjectFunded}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Check
          </button>
        </footer>
        <p className="text-gray-400 mt-4">
          Funded: {isProjectFunded ? "Yes" : "No"}
        </p>
      </div>

      {/* UI for Get Project Next Payment */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Project Next Payment
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetProjectNextPayment}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get Next Payment
          </button>
        </footer>
        {projectNextPayment && (
          <p className="text-gray-400 mt-4">
            Next Payment: {projectNextPayment}
          </p>
        )}
      </div>

      {/* UI for Get Project Owner */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Project Owner
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetProjectOwner}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get Owner
          </button>
        </footer>
        {projectOwner && (
          <p className="text-gray-400 mt-4">Owner: {projectOwner}</p>
        )}
      </div>

      {/* UI for Get Project Info */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Project Info
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetProjectInfo}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get Info
          </button>
        </footer>
        {projectInfo && (
          <p className="text-gray-400 mt-4">
            Info: {JSON.stringify(projectInfo)}
          </p>
        )}
      </div>

      {/* Donate USD */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Donate USD
        </h3>
        <div className="my-3">
          <label className="block text-gray-400">Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input input-bordered w-full focus:ring focus:outline-none"
            placeholder="Amount in USD"
          />
        </div>
        <footer className="p-4">
          <button
            onClick={handleDonateUSD}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Donate
          </button>
        </footer>
      </div>

      {/* Faucet */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Faucet
        </h3>
        <footer className="p-4">
          <button
            onClick={handleFaucet}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Claim Token
          </button>
        </footer>
      </div>

      {/* GetNoOfFundedProjects */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Number of Funded Projects
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetNoOfFundedProjects}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get
          </button>
        </footer>
      </div>

      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get USD Received By Project
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetUSDReceivedByProject}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get
          </button>
        </footer>
      </div>
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Number of Surveys
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetNoOfSurveys}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get
          </button>
        </footer>
      </div>

      {/* handleGetNoOfProjectProposals */}
      <div className="mt-4 p-4">
        <h3 className="text-xl font-semibold text-gray-400 text-center">
          Get Number of Project Proposals
        </h3>
        <footer className="p-4">
          <button
            onClick={handleGetNoOfProjectProposals}
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Get
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ContractInteraction;
