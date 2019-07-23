import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DataSet {
  @PrimaryColumn('text')
  public did: string;

  @Column('text')
  public path: string;

  @Column('text', { nullable: true })
  public hash: string;
}
