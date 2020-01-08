import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Challenge {
  @PrimaryColumn('text')
  public challenge: string;

  @Column('text')
  public ethereumAddress: string;
}
