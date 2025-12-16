import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BusinessServiceEntity } from '../business-services/business-service.entity';
import { Business } from '../business/business.entity';
import { VerifyBusinessDto, CreateBusinessDto } from '../business/business.dto';
import { User } from '../user/user.entity';
import { SocialPostEntity } from '../business-services/social-post.entity';
import { S3Service } from '../aws/s3.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(BusinessServiceEntity)
    private servicesRepo: Repository<BusinessServiceEntity>,
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
    @InjectRepository(SocialPostEntity)
    private socialRepo: Repository<SocialPostEntity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
    private readonly s3service: S3Service,
  ) {}

  async getBusinessesDistinct() {
    const rows = await this.businessRepo
      .createQueryBuilder('b')
      .leftJoin('b.services', 's')
      .distinct(true)
      .getRawMany();

    return { businesses: rows };
  }

  // 🔹 Get all services of a business
  async getBusinessServices(businessId: string) {
    const services = await this.servicesRepo.find({
      where: { business: { id: businessId } },
      relations: ['business'],
    });

    if (!services.length) {
      return { error: 'No services found for this business' };
    }

    return {
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        available: s.available,
        durationMinutes: s.durationMinutes,
      })),
    };
  }

  // 🔹 Save/update services for a business
  async saveServices(
    businessId: string,
    services: {
      name: string;
      price: number;
      available: boolean;
      durationMinutes?: number;
    }[],
  ) {
    const business = await this.businessRepo.findOne({
      where: { id: businessId },
    });
    if (!business) return { error: 'Business not found' };

    // Add new services
    const toInsert = services.map((s) =>
      this.servicesRepo.create({
        business,
        name: s.name,
        price: s.price, // ✅ now accepts number
        available: s.available,
        durationMinutes: s.durationMinutes,
      }),
    );

    await this.servicesRepo.save(toInsert);

    return { message: 'Services updated successfully' };
  }

  // 🔹 Create business
  // src/components/business/business.service.ts
  async createBusiness(ownerId: string, dto: CreateBusinessDto) {
    const owner = await this.userRepo.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new Error('Owner not found');
    }

    const business = this.businessRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      category: dto.category,
      address: dto.address,
      pancard: dto.pancard,
      aadhaarCard: dto.aadhaarCard,
      gst: dto.gst,
      openingHours: dto.openingHours,
      logoKey: dto.logoKey,
      coverKey: dto.coverKey,
      latitude: dto.latitude ? Number(dto.latitude) : null,
      longitude: dto.longitude ? Number(dto.longitude) : null,
      owner,
    });

    return await this.businessRepo.save(business);
  }

  // 🔹 Update business
  async updateBusiness(id: string, name?: string) {
    const business = await this.businessRepo.findOne({ where: { id } });
    if (!business) return { error: 'Business not found' };

    if (name) business.name = name;
    const updated = await this.businessRepo.save(business);
    return { message: 'Business updated', business: updated };
  }

  // 🔹 Delete business
  async deleteBusiness(id: string) {
    const result = await this.businessRepo.delete(id);
    if (result.affected === 0) return { error: 'Business not found' };
    return { message: 'Business deleted successfully' };
  }

  async uploadSocialContent(
    businessId: string | null,
    files: { base64: string; filename: string; mimetype: string }[],
    caption?: string,
  ) {
    let business: Business | null = null;

    if (businessId) {
      business = await this.businessRepo.findOne({ where: { id: businessId } });
      if (!business) throw new Error('Business not found');
    }

    const posts = [];
    for (const file of files) {
      const url = await this.s3service.uploadBase64(
        file.base64,
        file.filename,
        file.mimetype,
        'social',
      );

      const post = this.socialRepo.create({
        business,
        url,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        caption,
      });

      posts.push(post);
    }

    await this.socialRepo.save(posts);
    return { message: 'Uploaded successfully', posts };
  }

  // 🔹 Fetch feed
  async getSocialFeed(businessId?: string) {
    if (businessId) {
      return this.socialRepo.find({
        where: { business: { id: businessId } },
        order: { createdAt: 'DESC' },
      });
    }
    return this.socialRepo.find({
      where: { business: null },
      order: { createdAt: 'DESC' },
    });
  }
  // 🔹 Inspect DB schema
  async getDatabaseInfo() {
    const metas = this.dataSource.entityMetadatas;
    const info: Record<string, string[]> = {};
    metas.forEach((m) => {
      info[m.tableName] = m.columns.map(
        (c) => c.databaseName || c.propertyName,
      );
    });
    return info;
  }

  async verifyPAN(panNumber: string): Promise<boolean> {
    // Use manual check or sandbox API
    // Example: simple format check
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNumber);
  }

  async verifyAadhaar(aadhaarNumber: string, otp?: string): Promise<boolean> {
    // Use sandbox API or OTP verification from UIDAI
    // Here we just check format for MVP
    const aadhaarRegex = /^[0-9]{12}$/;
    return aadhaarRegex.test(aadhaarNumber);
  }
}
//   async verifyBusiness(id: number, dto: VerifyBusinessDto): Promise<Business> {
//     const business = this.businessRepo.find(b => b.id === id);
//     if (!business) throw new Error('Business not found');

//     if (dto.panNumber) {
//       business.panVerified = await this.verifyPAN(dto.panNumber);
//     }
//     if (dto.aadhaarNumber) {
//       business.aadhaarVerified = await this.verifyAadhaar(dto.aadhaarNumber, dto.otp);
//     }

//     return business;
//   }
// }
