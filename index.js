/*
Polygon = 137
*/
const Network = 1;

(async () => {
})();
var WalletAddress = "";
var WalletBalance = "";
var TokenBalance = "";

contract = new ethers.Contract(ABI20, ADDRESS20);

async function checkAndSwitchNetwork() {
    try {
        const currentNetwork = await window.ethereum.request({ method: 'net_version' });
        if (currentNetwork != Network.toString()) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x1` }] // 폴리곤 0x89
            });
            alert("네트워크를 'Ethereum' 네트워크로 변경합니다.");
            return true;
        }
        return false;
    } catch (error) {
        console.error(`네트워크 전환 중 오류 발생: ${error.message}`);
        alert(`네트워크 전환 중 오류 발생: ${error.message}`);
        return false;
    }
}

async function connectWallet() {
    try {
        if (window.ethereum) {
            // 네트워크 확인 및 전환
            const networkSwitched = await checkAndSwitchNetwork();

            // 네트워크 전환이 필요 없었거나 성공적으로 전환된 경우에만 계속 진행
            if (networkSwitched || window.ethereum.networkVersion == Network.toString()) {
                // Ethereum 지갑 연결 요청
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length === 0) {
                    throw new Error("No accounts found");
                }

                // 연결된 지갑의 주소 가져오기
                const address = accounts[0];
                WalletAddress = address;

                // 지갑 주소를 HTML 요소에 표시
                await checkEtherBalance();
                await checkTokenBalance(address);
                document.getElementById("walletAddress").innerText = `연결된 지갑 주소: ${address}`;

                const walletButton = document.querySelector(".btn-connect-wallet");
                walletButton.innerText = "지갑 새로고침";
                walletButton.onclick = refreshWallet;
            }
        } else {
            throw new Error("Ethereum provider is not available");
        }
    } catch (error) {
        console.error(`지갑 연결 실패: ${error.message}`);
        alert(`지갑 연결 실패: ${error.message}`);
    }
}

async function refreshWallet() {
    await connectWallet();
}

async function checkEtherBalance() {
    try {
        window.web3 = new Web3(window.ethereum);

        const etherBalance = await web3.eth.getBalance(WalletAddress);
        const adjustedEtherBalance = web3.utils.fromWei(etherBalance, 'ether');
        document.getElementById("walletBalance").innerText = `이더리움 잔고: ${adjustedEtherBalance} ETH`;
    } catch (error) {
        console.error(`이더리움 잔고 확인 오류: ${error.message}`);
        alert(`이더리움 잔고 확인 오류: ${error.message}`);
    }
}

async function checkTokenBalance(address) {
    try {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const balance = await contract.methods.balanceOf(address).call();
        const adjustedBalance = balance / 10 ** 18; // 발행량을 10^18로 나눔
        document.getElementById("tokenBalance").innerText = `토큰 잔고: ${adjustedBalance} SPONGE`;
    } catch (error) {
        console.error(`토큰 잔고 확인 오류: ${error.message}`);
        alert(`토큰 잔고 확인 오류: ${error.message}`);
    }
}

async function TokenAdd() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Metamask에 추가할 토큰 정보
        const tokenInfo = {
            type: "ERC20", // 토큰 종류 (ERC20, BEP20 등)
            options: {
                address: ADDRESS20, // 토큰의 스마트 컨트랙트 주소
                symbol: "SPONGE", // 토큰 심볼 (예: ETH, DAI)
                decimals: 18, // 토큰의 소수점 자리수
                image: 'https://rt-ctrl.github.io/spongeWeb/Sponge.png'
            },
        };

        // Metamask에 토큰 추가 요청
        await ethereum.request({
            method: 'wallet_watchAsset',
            params: tokenInfo,
        });

        alert("토큰이 메타마스크에 추가되었습니다.");
    } catch (error) {
        console.error("토큰 추가 오류:", error);
        alert("토큰 추가에 실패했습니다. 메타마스크 설정을 확인해주세요.");
    }
}

async function checkBalance() {
    try {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);
        const address = document.getElementById("balanceAddress").value;
        const balance = await contract.methods.balanceOf(address).call();
        const adjustebalanceOf = balance / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        document.getElementById("balanceResult").innerText = `잔고: ${adjustebalanceOf} SPONGE`;
    } catch (error) {
        console.error(error);
        document.getElementById("balanceResult").innerText = `에러: ${error.message}`;
    }
}

async function transfer() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Metamask와 연결된 web3 인스턴스 생성
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const address = document.getElementById("transferAddress").value;
        const amount = web3.utils.toWei(document.getElementById("transferAmount").value, 'ether');
        const adjusteAmount = amount / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 트랜잭션 실행
        await contract.methods.transfer(address, amount).send({ from: ethereum.selectedAddress });

        document.getElementById("transferResult").innerText = "전송 성공!";
        alert(`전송이 성공적으로 완료되었습니다! 전송된 수량: ${adjusteAmount} 개`);
    } catch (error) {
        console.error(error);
        document.getElementById("transferResult").innerText = `에러: ${error.message}`;
    }
}

async function mint() {
    try {
        // Metamask에 연결된 지갑 요청
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(ABI20, ADDRESS20);

        // 민팅할 수량과 수신자 주소를 가져옴
        const toAddress = document.getElementById("mintAddress").value.trim();
        const amount = web3.utils.toWei(document.getElementById("mintAmount").value, 'ether');
        const adjusteAmount = amount / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(toAddress)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 민팅 트랜잭션 실행
        await contract.methods.mint(toAddress, amount).send({ from: ethereum.selectedAddress });

        document.getElementById("MintResult").innerText = "민트 성공!";
        alert(`민트가 성공적으로 완료되었습니다! 민팅된 수량: ${adjusteAmount} 개`);
    } catch (error) {
        console.error(error);
        document.getElementById("MintResult").innerText = `에러: ${error.message}`;
    }
}

// 블록체인 콜 함수
async function checkPaused() {
    try {
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const paused = await contract.methods.paused().call();
        document.getElementById("pauseNow").innerText = `${paused ? "정지 상태" : "정상 상태"}`;
    } catch (error) {
        console.error(error);
        document.getElementById("pauseNow").innerText = `에러: ${error.message}`;
    }
}

async function checkTotalSupply() {
    try {
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const totalSupply = await contract.methods.totalSupply().call();
        const adjustedTotalSupply = totalSupply / 10 ** 18;
        document.getElementById("totalSupplyResult").innerText = `전체 발행량: ${adjustedTotalSupply} SPONGE`;
    } catch (error) {
        console.error(error);
        document.getElementById("totalSupplyResult").innerText = `에러: ${error.message}`;
    }
}

// 정지 함수
async function pauseContract() {
    try {
        // Metamask에 연결된 지갑 요청
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(ABI20, ADDRESS20);

        // 현재 선택된 계정 가져오기
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        // pause 메서드 호출
        const transaction = await contract.methods.pause().send({ from: defaultAccount });
        console.log("정지 - 성공 : " + transaction);
        document.getElementById("pauseResult").innerText = "계약 정지 성공!";
    } catch (error) {
        console.error(error);
        document.getElementById("pauseResult").innerText = `에러: ${error.message}`;
    }
}

// 정지 해제 함수
async function unpauseContract() {
    try {
        // Metamask에 연결된 지갑 요청
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(ABI20, ADDRESS20);

        // 현재 선택된 계정 가져오기
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        // pause 메서드 호출
        const transaction = await contract.methods.unpause().send({ from: defaultAccount });
        console.log("정지 해제 - 성공 : " + transaction);
        document.getElementById("unpauseResult").innerText = "계약 정지 해제 성공!";
    } catch (error) {
        console.error(error);
        document.getElementById("unpauseResult").innerText = `에러: ${error.message}`;
    }
}

// 소각
async function burn() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Ethereum 지갑 연결 요청
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error("No accounts found");
        }
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const address = accounts[0];
        const amount = web3.utils.toWei(document.getElementById("burnAmount").value, 'ether');
        const adjusteAmount = amount / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 트랜잭션 실행
        await contract.methods.burn(amount).send({ from: ethereum.selectedAddress });

        document.getElementById("burnResult").innerText = "소각 성공!";
        alert(`소각이 성공적으로 완료되었습니다! 소각된 수량: ${adjusteAmount} 개`);
    } catch (error) {
        console.error(error);
        document.getElementById("burnResult").innerText = `에러: ${error.message}`;
    }
}

async function burnFrom() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Metamask와 연결된 web3 인스턴스 생성
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);

        const address = document.getElementById("burnFromAddress").value;
        const amount = web3.utils.toWei(document.getElementById("burnFromAmount").value, 'ether');
        const adjusteAmount = amount / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 트랜잭션 실행
        await contract.methods.burnFrom(address, amount).send({ from: ethereum.selectedAddress });

        document.getElementById("burnFromResult").innerText = "소각 성공!";
        alert(`소각이 성공적으로 완료되었습니다! 소각된 수량: ${adjusteAmount} 개`);
    } catch (error) {
        console.error(error);
        document.getElementById("burnFromResult").innerText = `에러: ${error.message}`;
    }
}

async function setLockup() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Ethereum 지갑 연결 요청
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error("No accounts found");
        }
        const address = accounts[0];

        // 입력값 가져오기
        const lockupAddress = document.getElementById("lockupAddress").value;
        const lockupMin = document.getElementById("lockupMin").value;
        const lockupAmount = web3.utils.toWei(document.getElementById("lockupAmount").value, 'ether');
        const adjusteAmount = lockupAmount / 10 ** 18; // 발행량을 10^18로 나눔

        // 락업 트랜잭션 실행
        await contract.methods.setLockup(lockupAddress, lockupMin, lockupAmount).send({ from: address });

        alert(`락업이 성공적으로 설정되었습니다. 락업 기간: ${lockupMin}분, 락업량: ${adjusteAmount}`);
    } catch (error) {
        console.error(error);
        alert(`락업 설정에 실패했습니다: ${error.message}`);
    }
}

async function releaseLockup() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Ethereum 지갑 연결 요청
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
            throw new Error("No accounts found");
        }
        const address = accounts[0];

        // 입력값 가져오기
        const releaseLockupAddress = document.getElementById("releaseLockupAddress").value;
        const releaseLockupAmount = web3.utils.toWei(document.getElementById("releaseLockupAmount").value, 'ether');
        const adjusteAmount = releaseLockupAmount / 10 ** 18; // 발행량을 10^18로 나눔

        // 락업 해제 트랜잭션 실행
        await contract.methods.releaseLockup(releaseLockupAddress, releaseLockupAmount).send({ from: address });

        alert(`락업이 성공적으로 해제되었습니다. 해제량: ${adjusteAmount}`);
    } catch (error) {
        console.error(error);
        alert(`락업 해제에 실패했습니다: ${error.message}`);
    }
}

async function checklockupSupply(){
    try {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);
        const address = document.getElementById("checklockupAddress").value;
        const balance = await contract.methods.lockedBalance(address).call();
        const adjustebalanceOf = balance / 10 ** 18; // 발행량을 10^18로 나눔

        const result = await contract.methods.lockedInfo(address).call();
        const remainingTime = result[1];

        const days = Math.floor(remainingTime / (24 * 60 * 60));
        const hours = Math.floor((remainingTime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
        const seconds = remainingTime % 60;

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        document.getElementById("checklockupResult").innerText = `락업된 수량: ${adjustebalanceOf} SPONGE`;
        document.getElementById("timechecklockupResult").innerText = `남은 시간: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
    } catch (error) {
        console.error(error);
        document.getElementById("checklockupResult").innerText = `에러: ${error.message}`;
    }
}

function toggleCategory(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        element.innerHTML = element.innerHTML.replace("&#9662;", "&#9652;");
    } else {
        content.style.display = "none";
        element.innerHTML = element.innerHTML.replace("&#9652;", "&#9662;");
    }
}

// 초기화 시 모든 카테고리 내용을 숨김
document.addEventListener("DOMContentLoaded", function () {
    const categories = document.querySelectorAll(".category-content");
    categories.forEach(category => category.style.display = "none");
});
