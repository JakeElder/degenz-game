import { GenOneToken } from "data/src";
import { Command } from "../../lib";
import data from "../../rarity_final.json";
import { Metaplex } from "@metaplex-foundation/js";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  ParsedAccountData,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { json } from "../../utils";

export default class InsertGenOneTokens extends Command {
  static description = "Insert Gen One Tokens";

  async run(): Promise<void> {
    const connection = new Connection(
      "https://still-empty-field.solana-mainnet.quiknode.pro/5b1b6b5c913ec79a20bef19d5ba5f63023e470d6"
    );
    const metaplex = new Metaplex(connection);

    const TREASURY_WALLET = "DegenzW7kWzac5zEdTWEuqVasoVMPKd16T3za2j6S3qR";
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 32, bytes: TREASURY_WALLET } },
        ],
      }
    );

    const ownedAddresses = accounts.map(
      (a) => (a.account.data as ParsedAccountData).parsed.info.mint
    );

    const entities = await Promise.all(
      data.map(async (e) => {
        const mint = new PublicKey(e.address);
        const nft = await metaplex.nfts().findByMint(mint);

        const state = ownedAddresses.includes(e.address)
          ? "OWNED_INTERNALLY"
          : "OWNED_EXTERNALLY";

        const mdt = nft.metadataTask.getResult()!;

        return GenOneToken.create({
          id: parseInt(e.id, 10),
          name: e.name,
          rarity: e.rarity,
          type: e.type === "Thought Police" ? "THOUGHT_POLICE" : "DEGEN",
          rank: e.rank,
          address: e.address,
          locked: state === "OWNED_INTERNALLY" && e.rank < 50,
          attributes: mdt.attributes,
          image: mdt.image,
          state,
        });
      })
    );

    await GenOneToken.insert(entities);
  }
}
