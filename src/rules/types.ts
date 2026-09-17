export interface RuleFinding {
	index: number;
	length: number;
	message: string;
	xp: number;
}

export interface Rule {
	id: string;
	scan(text: string): RuleFinding[];
}