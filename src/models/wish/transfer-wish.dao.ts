export interface TransferWishDAO {
    readonly id: string;
    readonly transferType: string;
    readonly additionalNote?: string;
    readonly createdAt: string;
    readonly userId: string;
}