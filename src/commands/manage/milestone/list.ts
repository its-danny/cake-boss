import { Argv } from "yargs";
import Table from "cli-table";
import { chain } from "lodash";
import { toSentenceSerial } from "underscore.string";
import { getConnection } from "typeorm";
import { canManage } from "../../../utils/permissions";
import Server from "../../../entity/server";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_MILESTONE, EMOJI_WORKING_HARD } from "../../../utils/emoji";
import getTableBorder from "../../../utils/get-table-border";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import Milestone from "../../../entity/milestone";
import { handleError } from "../../../utils/errors";

interface Arguments extends CommandArguments {
  page?: number;
}

export const getMilestoneList = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`
      };
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id }
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const perPage = 5;
    const totalPages = Math.ceil((await Milestone.count({ where: { server } })) / perPage);

    if (args.page && (!Number.isInteger(args.page) || args.page > totalPages)) {
      return { content: `${EMOJI_ERROR} Invalid page number, sorry!` };
    }

    const currentPage = args.page ? args.page : 1;

    const connection = getConnection();
    const milestones: Milestone[] = await connection
      .getRepository(Milestone)
      .createQueryBuilder("milestone")
      .where({ server })
      .orderBy("milestone.id", "ASC")
      .skip(perPage * (currentPage - 1))
      .take(perPage)
      .getMany();

    if (milestones.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} There are no milestones!` };
    }

    const table = new Table({
      head: ["ID", "Amount", "Roles to Give", "Announcement"],
      style: { head: [], border: [] },
      chars: getTableBorder()
    });

    milestones.forEach(milestone => {
      const roleNames = chain(milestone.roleIds)
        .map(roleId => {
          const role = args.message.guild.roles.get(roleId);

          if (role) {
            return role.name;
          }

          return undefined;
        })
        .compact()
        .value();

      table.push([
        milestone.id,
        milestone.amount,
        roleNames.length > 0 ? toSentenceSerial(roleNames) : "none",
        milestone.announcement || ""
      ]);

      return false;
    });

    return {
      content: `${EMOJI_MILESTONE} **Milestone List** [ Page ${currentPage} of ${totalPages} ]\n\n\`\`\`\n\n${table.toString()}\n\`\`\``
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "list [page]";
export const describe = "View milestone list";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getMilestoneList(args);
};
