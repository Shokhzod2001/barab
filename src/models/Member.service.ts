import MemberModel from "../schema/Member.model";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import AuthService from "./Auth.service";

class MemberService {
  private readonly memberModel;
  private readonly authService: AuthService;
  constructor() {
    this.memberModel = MemberModel;
    this.authService = new AuthService();
  }
  // SPA

  public async getRestaurant(): Promise<Member> {
    const result = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .lean()
      .exec();
    result.target = "Test";
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async signup(input: MemberInput): Promise<Member> {
    input.memberPassword = await this.authService.hashPassword(
      input.memberPassword
    );

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE },
        },
        { memberNick: 1, memberPassword: 1, memberStatus: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    const isMatch = await this.authService.comparePasswords(
      input.memberPassword,
      member.memberPassword
    );
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const result = await this.memberModel
      .findOneAndUpdate({ _id: memberId }, input, { new: true })
      .exec();

    if (!result)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

    return result;
  }

  public async getTopChefs(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberType: MemberType.CHEF,
      })
      .limit(4)
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getAllChefs(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberType: MemberType.CHEF,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    return await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.USER,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true }
      )
      .exec();
  }

  // BSSR
  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberType: MemberType.RESTAURANT })
      .exec();
    console.log("exist:", exist);
    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

    input.memberPassword = await this.authService.hashPassword(
      input.memberPassword
    );

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await this.authService.comparePasswords(
      input.memberPassword,
      member.memberPassword
    );
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.USER })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getChefs(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.CHEF })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateChosenUSer(input: MemberUpdateInput): Promise<Member> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
    if (!result)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

    return result;
  }

  public async createNewChef(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel
      .findOne({ memberNick: input.memberNick, memberPhone: input.memberPhone })
      .exec();
    console.log("exist:", exist);
    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

    try {
      const result = await this.memberModel.create(input);
      return result;
    } catch (err) {
      console.error("Error, model:createNewChef:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default MemberService;
